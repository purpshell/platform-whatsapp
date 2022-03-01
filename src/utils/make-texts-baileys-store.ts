import { AnyWASocket, BaileysEventEmitter, Chat, Contact, GroupMetadata, isJidBroadcast, isJidGroup, jidDecode, WAMessageKey, WAMessageUpdate } from '@adiwajshing/baileys'
import { MessageBehavior, ServerEvent, ServerEventType } from '@textshq/platform-sdk'
import type { Logger } from 'pino'
import { Brackets, Connection, EntityManager, In } from 'typeorm'
import DBMessage from '../entities/DBMessage'
import DBParticipant from '../entities/DBParticipant'
import DBThread from '../entities/DBThread'
import DBUser from '../entities/DBUser'
import type { MappingContext } from '../types'
import chunkedWrite from './chunked-write'
import { DBEventsPublisher } from './db-events-publisher'
import dbGetEarliestMsgOrderKey from './db-get-earliest-msg-order-key'
import dbGetLatestMsgOrderKey from './db-get-latest-msg-order-key'
import { shouldExcludeMessage, updateItems, mapMessageID, profilePictureUrl } from './generics'
import mapPresenceUpdate from './map-presence-update'

type StoreBindContext = Pick<AnyWASocket, 'groupMetadata' | 'type'>

const DEFAULT_CHUNK_SIZE = 350

const makeTextsBaileysStore = (
  db: Connection,
  logger: Logger,
  mappingCtx: MappingContext,
  publishEvent: (event: ServerEvent) => void,
) => {
  const { accountID } = mappingCtx

  db.subscribers.push(
    new DBEventsPublisher(DBThread, {
      publish: (event, item) => {
        switch (event) {
          case 'delete':
            const { id } = item as DBThread
            publishEvent({
              type: ServerEventType.STATE_SYNC,
              objectName: 'thread',
              objectIDs: {},
              mutationType: 'delete',
              entries: [id],
            })
            break
          case 'insert':
            const dbItem = DBThread.prepareForSending(item as DBThread, accountID)
            publishEvent({
              type: ServerEventType.STATE_SYNC,
              objectName: 'thread',
              objectIDs: {},
              mutationType: 'upsert',
              entries: [dbItem],
            })
            break
          case 'update':
            const { key, update } = item as any
            const processedUpdate = DBThread.prepareForSending<Partial<DBThread>>(update, accountID)

            if (!processedUpdate.messages?.items?.length) {
              delete processedUpdate.messages
            }

            // if the update has more data than just the "id" & "_original" keys
            if (Object.keys(processedUpdate).length > 2) {
              publishEvent({
                type: ServerEventType.STATE_SYNC,
                objectName: 'thread',
                objectIDs: {},
                mutationType: 'update',
                entries: [{ ...processedUpdate, ...key }],
              })
            }
            break
        }
      },
    }),
    new DBEventsPublisher(DBParticipant, {
      publish: (event, item) => {
        switch (event) {
          case 'delete':
            const { id } = item as DBParticipant
            publishEvent({
              type: ServerEventType.STATE_SYNC,
              objectName: 'participant',
              objectIDs: { threadID: id },
              mutationType: 'delete',
              entries: [id],
            })
            break
          case 'insert':
            const participant = (item as DBParticipant).toParticipant()
            DBUser.prepareForSending(participant, accountID)

            publishEvent({
              type: ServerEventType.STATE_SYNC,
              objectName: 'participant',
              objectIDs: { threadID: participant.id },
              mutationType: 'upsert',
              entries: [participant],
            })
            break
          case 'update':
            const { key, update } = item as any
            publishEvent({
              type: ServerEventType.STATE_SYNC,
              objectName: 'participant',
              objectIDs: { threadID: key.threadID },
              mutationType: 'update',
              entries: [{ ...update, ...key }],
            })
            break
        }
      },
    }),
    new DBEventsPublisher(DBMessage, {
      publish: (event, item) => {
        switch (event) {
          case 'delete':
            const id = (item as Partial<DBMessage>)
            publishEvent({
              type: ServerEventType.STATE_SYNC,
              objectName: 'message',
              objectIDs: { threadID: id.threadID },
              mutationType: 'delete',
              entries: [id.id!],
            })
            break
          case 'insert':
            const dbItem = DBMessage.prepareForSending(item as DBMessage, accountID)

            publishEvent({
              type: ServerEventType.STATE_SYNC,
              objectName: 'message',
              objectIDs: { threadID: dbItem.threadID },
              mutationType: 'upsert',
              entries: [dbItem],
            })
            break
          case 'update':
            const { key, update } = item as any
            const processedUpdate = DBMessage.prepareForSending(update as Partial<DBMessage>, accountID)

            publishEvent({
              type: ServerEventType.STATE_SYNC,
              objectName: 'message',
              objectIDs: { threadID: key.threadID },
              mutationType: 'update',
              entries: [{ ...key, ...processedUpdate }],
            })
            break
        }
      },
    }),
  )

  const bind = (ev: BaileysEventEmitter, { groupMetadata, type: connType }: StoreBindContext) => {
    const upsertWAChats = async (
      db: Connection | EntityManager,
      chats: Chat[],
      metadatas: { [id: string]: GroupMetadata },
      shouldFireEvent?: boolean,
    ) => {
      const totalParticipantList: DBParticipant[] = []
      const addedParticipants = new Set<string>()

      const items = chats.map(chat => {
        const mapped = new DBThread()
        mapped.original = { chat, metadata: metadatas[chat.id] }
        mapped.shouldFireEvent = shouldFireEvent
        mapped.mapFromOriginal(mappingCtx)

        for (const item of mapped.participantsList!) {
          const id = `${item.threadID},${item.id}`
          if (!addedParticipants.has(id)) {
            // when a participant is inserted alongside a thread,
            // no need to fire the event for it
            item.shouldFireEvent = false
            totalParticipantList.push(item)
            addedParticipants.add(id)
          } else {
            logger.info({ threadID: chat.id, id }, 'duplicate participant')
          }
        }

        return mapped
      })

      await Promise.all([
        chunkedWrite(db.getRepository(DBThread), items, DEFAULT_CHUNK_SIZE),
        chunkedWrite(db.getRepository(DBParticipant), totalParticipantList, DEFAULT_CHUNK_SIZE),
      ])

      return {
        chats,
        participants: totalParticipantList,
      }
    }

    const saveMeUser = async (me: Contact) => {
      // this has to be done before we await since `this` can change after the context switch
      const meUser = DBUser.fromOriginal(me, mappingCtx)
      meUser.isSelf = true
      meUser.imgURL = profilePictureUrl(accountID, meUser.id)
      await db.getRepository(DBUser).save(meUser)
    }

    const fetchMessagesInDB = async (db: Connection | EntityManager, keys: { key: WAMessageKey }[]) => {
      const repo = db.getRepository(DBMessage)
      // find all the messages to be updated
      const qb = repo
        .createQueryBuilder()
        .where(new Brackets(
          qb => {
            for (const { key } of keys) {
              const msgId = mapMessageID(key)
              qb = qb.orWhere(`(thread_id='${key.remoteJid!}' AND id='${msgId}')`)
            }
            return qb
          },
        ))
      const dbItems = await qb.getMany()
      return dbItems
    }

    async function updateMessages<T extends { key: WAMessageKey }>(updates: T[], applyUpdate: (msg: DBMessage, update: T) => void) {
      // create a map for which thread ID has number of read messages
      const readMsgsUpdateMap: { [threadId: string]: number } = {}
      // map for messageId => update for easy access
      const map: { [id: string]: T } = {}
      for (const update of updates) {
        const msgId = mapMessageID(update.key)
        const id = `${update.key.remoteJid!},${msgId}`
        map[id] = update
      }

      await db.transaction(
        async db => {
          const repo = db.getRepository(DBMessage)
          const chatRepo = db.getRepository(DBThread)
          // find all the messages to be updated
          const dbItems = await fetchMessagesInDB(db, updates)
          // update each message & save
          for (const item of dbItems) {
            const id = `${item.threadID},${item.id!}`
            const wasSeenEarlier = item.original.seenByMe
            applyUpdate(item, map[id])
            // if the message was just marked seen
            // and it's not from the user themselves
            // add to the thread read counter
            if (!wasSeenEarlier && item.original.seenByMe) {
              readMsgsUpdateMap[item.threadID] = readMsgsUpdateMap[item.threadID] || 0
              readMsgsUpdateMap[item.threadID] += 1
            }
          }
          await repo.save(dbItems as any[])
          logger.info({ updates }, `updating ${dbItems.length}/${updates.length} messages`)
          // after messages are saved, if there are any updates to thread read counters
          // execute those updates
          const threadIds = Object.keys(readMsgsUpdateMap)
          if (threadIds.length) {
            const chats = await chatRepo.find({ id: In(threadIds) })
            for (const chat of chats) {
              // if the chat had unread messages
              if (chat.unreadCount > 0) {
                chat.update({ unreadCount: 0 }, mappingCtx)
                logger.info({ id: chat.id }, 'marked chat unread')
              }
            }
            await chatRepo.save(chats, { chunk: 50 })
          }
        },
      )
    }

    ev.on('creds.update', ({ me }) => {
      me && saveMeUser(me)
    })

    ev.on('connection.update', ({ legacy }) => {
      legacy?.user && saveMeUser(legacy.user)
    })

    ev.on('chats.set', async ({ chats, isLatest }) => {
      logger.info({ length: chats.length }, 'got chats history')
      await db.transaction(async db => {
        if (isLatest) {
          // remove everything as we've got a new latest set of chats
          await db.getRepository(DBThread).delete({})
          await db.getRepository(DBParticipant).delete({})
          logger.info('cleared existing chats')
        }
        const { chats: threads, participants } = await upsertWAChats(db, chats, {}, false)
        logger.info({ chats: threads.length, participants: participants.length }, 'saved chats history')
      })
    })

    ev.on('messages.set', async ({ messages, isLatest }) => {
      if (!isLatest && connType === 'legacy') {
        return
      }
      logger.info({ length: messages.length, isLatest }, 'got messages history')
      await db.transaction(async db => {
        let key = 0
        if (isLatest) {
          // remove everything
          await db.getRepository(DBMessage).delete({})
          logger.info('cleared existing messages')
        } else {
          key = await dbGetEarliestMsgOrderKey(db) || 0
        }

        const dbMessages = messages.map(m => {
          const mappedMsg = new DBMessage()
          mappedMsg.original = { message: m }
          mappedMsg.mapFromOriginal(mappingCtx)
          mappedMsg.shouldFireEvent = false
          mappedMsg.orderKey = key

          key -= 1

          return mappedMsg
        })

        await chunkedWrite(db.getRepository(DBMessage), dbMessages, DEFAULT_CHUNK_SIZE)

        logger.info({ messages: dbMessages.length }, 'saved message history')
      })
    })

    const contactsUpsert = (contacts: Contact[]) => (
      db.transaction(
        async db => {
          const items: DBUser[] = []
          // only save individual contacts
          for (const item of contacts) {
            if (jidDecode(item.id).server === 's.whatsapp.net') {
              const mapped = DBUser.fromOriginal(item, mappingCtx)
              mapped.shouldFireEvent = false
              items.push(mapped)
            }
          }
          await chunkedWrite(db.getRepository(DBUser), items, DEFAULT_CHUNK_SIZE)
        },
      )
    )

    ev.on('contacts.set', ({ contacts }) => {
      logger.info({ length: contacts.length }, 'got contact history')
      contactsUpsert(contacts)
    })

    ev.on('contacts.upsert', contacts => {
      logger.info({ length: contacts.length }, 'upserting contacts')
      contactsUpsert(contacts)
    })

    ev.on('chats.update', async updates => {
      updates = updates.filter(u => !isJidBroadcast(u.id!))
      if (updates.length) {
        const shouldUpsert = !!updates.find(u => !!u.conversationTimestamp)
        const updated = await updateItems(
          updates,
          db.getRepository(DBThread),
          mappingCtx,
          shouldUpsert
            ? async update => {
              const metadata = isJidGroup(update.id!) ? await groupMetadata(update.id!, true) : undefined
              const thread = new DBThread()
              thread.original = { chat: update, metadata }
              thread.mapFromOriginal(mappingCtx)
              await db.getRepository(DBParticipant).save(thread.participantsList!)
              return thread
            }
            : undefined,
        )
        logger.debug({ updates }, `updating ${updated.length}/${updates.length} chats`)
      }
    })

    ev.on('chats.upsert', async upserts => {
      const metadataList = await Promise.all(
        upserts.map(update => (isJidGroup(update.id) ? groupMetadata(update.id, true) : undefined)),
      )
      const metadataMap = metadataList.reduce(
        (dict, item) => {
          if (item) {
            dict[item.id] = item
          }
          return dict
        }, {} as { [id: string]: GroupMetadata },
      )
      const updated = await db.transaction(db => upsertWAChats(db, upserts, metadataMap))
      logger.info({ threads: updated.chats }, `upserted ${updated.chats.length} chats`)
    })

    ev.on('chats.delete', async ids => {
      await db.transaction(
        async db => {
          const repo = db.getRepository(DBThread)
          const chats = await repo.find({ id: In(ids) })
          await repo.remove(chats, { chunk: 500 })

          logger.info({ ids }, 'deleted chats')
        },
      )
    })

    ev.on('contacts.update', async updates => {
      const updated = await db.transaction(db => updateItems(updates, db.getRepository(DBUser), mappingCtx))
      logger.info({ updates }, `updating ${updated.length}/${updates.length} contacts`)
    })

    ev.on('messages.upsert', ({ messages, type }) => {
      logger.info({ messages: messages.map(m => m.key) }, 'messages recv')

      db.transaction(async db => {
        let key = (await dbGetLatestMsgOrderKey(db)) || 0

        const existingMessageMap: { [id: string]: DBMessage } = { }
        const msgs = await fetchMessagesInDB(db, messages)
        for (const msg of msgs) {
          existingMessageMap[`${msg.threadID},${msg.id}`] = msg
        }

        const mapped: DBMessage[] = []
        for (const msg of messages) {
          if (!shouldExcludeMessage(msg)) {
            const uqId = `${msg.key.remoteJid},${mapMessageID(msg.key)}`

            const mappedMsg = existingMessageMap[uqId] || new DBMessage()
            if (mappedMsg.original) {
              mappedMsg.original.message = msg
            } else {
              mappedMsg.original = { message: msg }
            }

            if (!mappedMsg.orderKey) {
              key += 1
              mappedMsg.orderKey = key
            }

            mappedMsg.mapFromOriginal(mappingCtx)

            if (type !== 'notify') {
              mappedMsg.behavior = MessageBehavior.KEEP_READ
            }

            mapped.push(mappedMsg)
          }
        }

        await db.getRepository(DBMessage).save(mapped, { chunk: 500 })
      })
    })

    ev.on('messages.update', async updates => {
      updateMessages(updates, (msg, { update, key }) => msg.update({ ...update, key }, mappingCtx))
    })

    ev.on('message-receipt.update', async updates => {
      updateMessages(updates, (msg, { receipt }) => msg.updateFromReceipt(receipt, mappingCtx))
    })

    ev.on('messages.delete', async item => {
      await db.transaction(
        async db => {
          const repo = db.getRepository(DBMessage)
          if ('all' in item) {
            // isn't supported yet
          } else {
            const msgs = await repo.find({
              id: In(item.keys.map(mapMessageID)),
            })
            logger.info(
              { msgs: msgs.map(m => m.original.message.key) },
              'deleting messages',
            )
            await repo.remove(msgs)
          }
        },
      )
    })

    ev.on('presence.update', ({ id, presences }) => {
      const events = mapPresenceUpdate(id, presences)
      for (const event of events) {
        publishEvent(event)
      }
    })

    ev.on('groups.update', update => {

    })

    ev.on('group-participants.update', async ({ id: threadID, participants, action }) => {
      await db.transaction(
        async db => {
          const repo = db.getRepository(DBParticipant)
          let dbParticipants: DBParticipant[]
          switch (action) {
            case 'add':
              dbParticipants = participants.map(
                id => (
                  DBParticipant.fromOriginal({ threadID, item: { id } })
                ),
              )
              break
            default:
              dbParticipants = await repo.find({ id: In(participants) })
              for (const participant of dbParticipants) {
                if (action === 'remove') participant.hasExited = true
                else participant.isAdmin = action === 'promote'
              }
              break
          }
          await repo.save(dbParticipants)
        },
      )
    })
  }

  return {
    bind,
  }
}

export default makeTextsBaileysStore
