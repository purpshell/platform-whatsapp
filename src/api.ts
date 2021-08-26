import bluebird from 'bluebird'
import matchSorter from 'match-sorter'
import makeConnection, { Chat as WAChat, SocketConfig, makeInMemoryStore, AnyAuthenticationCredentials, BaileysEventEmitter, base64EncodedAuthenticationCredentials, Browsers, DisconnectReason, isGroupID, UNAUTHORIZED_CODES, WAMessage, AnyRegularMessageContent, AnyMediaMessageContent, promiseTimeout, BaileysEventMap, unixTimestampSeconds, ChatModification, GroupMetadata, delay, WAMessageUpdate, MessageInfoUpdate, MiscMessageGenerationOptions, STORIES_JID, generateMessageID } from '@adiwajshing/baileys'
import { texts, PlatformAPI, OnServerEventCallback, MessageSendOptions, InboxName, LoginResult, ConnectionState, ConnectionStatus, ServerEventType, OnConnStateChangeCallback, ReAuthError, CurrentUser, MessageContent, ConnectionError, PaginationArg, AccountInfo, ActivityType, LoginCreds, Thread, Paginated, User, PhoneNumber, ServerEvent, Message } from '@textshq/platform-sdk'
import P from 'pino'

import getMappers, { mapMessageID, unmapMessageID } from './mappers'
import { hasUrl, isBroadcastID, numberFromJid, textsWAKey, removeServer, CONNECTION_STATE_MAP, PARTICIPANT_ACTION_MAP, whatsappID, PRESENCE_MAP, makeMutex, canReconnect } from './util'
import { CHAT_MUTE_DURATION_S } from './constants'

type Transaction = ReturnType<typeof texts.Sentry.startTransaction>

const MESSAGE_PAGE_SIZE = 15
const THREAD_PAGE_SIZE = 15
const DELAY_CONN_STATUS_CHANGE = 20_000
const ATTACHMENT_UPDATE_WAIT_TIME_MS = 20_000

const config: Partial<SocketConfig> = {
  version: [2, 2130, 9],
  logger: P().child({ class: 'texts-baileys', level: texts.IS_DEV ? 'debug' : 'silent' }),
  browser: Browsers.appropriate('Chrome'),
  connectTimeoutMs: 150_000,
  phoneResponseTimeMs: 15_000,
}

export default class WhatsAppAPI implements PlatformAPI {
  private accountID: string

  private client?: ReturnType<typeof makeConnection> // TODO: make type

  private readonly store = makeInMemoryStore({
    logger: config.logger!.child({ class: 'texts-baileys-store' }),
    chatKey: textsWAKey,
  })

  private readonly mappers = getMappers(this.store)

  private readonly sendingMessageIDs = new Set<string>()

  private session?: AnyAuthenticationCredentials

  private evCallback: OnServerEventCallback = () => {}

  private connCallback: OnConnStateChangeCallback = () => {}

  private connStatusTimeout: NodeJS.Timeout

  private lastConnStatus: ConnectionStatus

  private lastChatsRecv: Date | undefined = undefined

  private readonly mutex = makeMutex()

  private connectionLifetimeTransaction: Transaction | undefined = undefined

  private connectionTransaction: Transaction | undefined = undefined

  init = async (session: AnyAuthenticationCredentials, { accountID }: AccountInfo) => {
    this.accountID = accountID
    this.session = session

    if (session) {
      await this.connect()
    }
  }

  dispose = () => {
    if (this.client) {
      this.client.ev.removeAllListeners('connection.update')
      this.client.end(undefined as any)
    }
    clearTimeout(this.connStatusTimeout)
  }

  private setConnStatus = (state: ConnectionState, immediate = false) => {
    clearTimeout(this.connStatusTimeout)
    const delay = (
      immediate
      || [ConnectionStatus.CONNECTED, ConnectionStatus.CONFLICT].includes(state.status)
      || [ConnectionStatus.DISCONNECTED, ConnectionStatus.CONFLICT].includes(this.lastConnStatus)
    ) ? 0 : DELAY_CONN_STATUS_CHANGE
    this.connStatusTimeout = setTimeout(() => {
      this.lastConnStatus = state.status
      this.connCallback({ ...state, canRetry: state.status === ConnectionStatus.DISCONNECTED })
    }, delay)
  }

  login = async ({ jsCodeResult }: LoginCreds): Promise<LoginResult> => {
    if (!jsCodeResult) {
      return { type: 'error', errorMessage: "Didn't get any data from login page" }
    }

    const ls = JSON.parse(jsCodeResult)
    if (!ls || !('WASecretBundle' in ls)) {
      return { type: 'error', errorMessage: 'Unable to retrieve authentication token' }
    }

    this.session = ls
    await this.connect()
    return { type: 'success' }
  }

  logout = async () => {
    await this.client?.logout()
  }

  private connect = async () => {
    try {
      await this.connectInternal()

      const start = Date.now()
      while ((Date.now() - start) < config.connectTimeoutMs!) {
        await delay(500)
        const { connection, lastDisconnect } = this.store.state
        if (connection === 'open') {
          break
        }
        if (connection === 'close' && !canReconnect(lastDisconnect?.error).isReconnecting) {
          break
        }
      }
      if (this.store.state.connection === 'close') {
        throw this.store.state.lastDisconnect?.error || new ConnectionError('failed to open')
      }
    } catch (error) {
      texts.log('connect failed:', error)
      const statusCode: number = error.output?.statusCode
      if (statusCode) {
        if (UNAUTHORIZED_CODES.includes(statusCode)) throw new ReAuthError(error.message)
        else if (error.message === DisconnectReason.timedOut) throw new ConnectionError('Timed out. Make sure your phone is connected to the internet')
      }
      // ensure cleanup
      // @ts-expect-error
      this.client!.end(undefined)
      throw error
    }
    texts.log('connected successfully')
  }

  private connectInternal = async (delayMs?: number) => {
    if (!!this.client && this.client.getState().connection !== 'close') {
      throw new Error('already connecting!')
    }
    delayMs && await delay(delayMs)
    this.client = makeConnection({ ...config, credentials: this.session })
    this.store.listen(this.client!.ev)
    this.registerCallbacks(this.client!.ev)
    this.client!.ev.emit('connection.update', { connection: 'connecting' })
  }

  getCurrentUser = (): CurrentUser => {
    const { user } = this.store.state
    if (!user) {
      throw new Error('user is not available')
    }
    return {
      id: user.jid,
      isSelf: true,
      fullName: user.name,
      displayText: numberFromJid(user.jid),
      phoneNumber: numberFromJid(user.jid),
      imgURL: this.ppUrl(user.jid),
    }
  }

  serializeSession = () => (
    base64EncodedAuthenticationCredentials(this.session!)
  )

  subscribeToEvents = (onEvent: OnServerEventCallback) => {
    this.evCallback = onEvent
  }

  onConnectionStateChange = (onEvent: OnConnStateChangeCallback) => {
    this.connCallback = onEvent
  }

  private registerCallbacks = async (ev: BaileysEventEmitter) => {
    const chatUpdateEvents = async (updates: (Partial<WAChat> | WAChat)[], type: 'upsert' | 'update' = 'update') => {
      const list: ServerEvent[] = []
      await Promise.all(
        updates.map(async update => {
          const jid = update.jid!
          if (jid !== STORIES_JID) {
            // load in the chat if it's new
            if (type === 'upsert') {
              await this.loadChat(jid)
            }
            if (Object.keys(update).length > 1) { // more keys than just "jid"
              list.push(
                {
                  type: ServerEventType.STATE_SYNC,
                  objectName: 'thread',
                  objectIDs: { threadID: jid },
                  mutationType: type,
                  entries: type === 'update' ? [this.mappers.mapChatPartial(update)] : this.mappers.mapChats([update as WAChat]),
                },
              )
            }
          }
        }),
      )
      if (list.length) this.evCallback(list)
    }
    const messageUpdateEvents = (updates: WAMessageUpdate[] | MessageInfoUpdate[]) => {
      texts.log('msg update', updates)
      const list: ServerEvent[] = []
      for (const { update, key } of updates) {
        if (key.remoteJid === STORIES_JID) continue

        const items = this.store.messages[key!.remoteJid!]
        // if the key has been updated, fetch that
        // otherwise fetch the key we're supposed to fetch
        const keyId = (update as Partial<WAMessage>).key?.id || key.id!
        const msg = items?.get(keyId)
        // messsage ID has changed
        // delete and reinsert
        if (keyId !== key.id) {
          list.push({
            type: ServerEventType.STATE_SYNC,
            objectName: 'message',
            objectIDs: { threadID: key.remoteJid!, messageID: mapMessageID(key) },
            mutationType: 'delete',
            entries: [mapMessageID(key)],
          })
          if (msg) {
            list.push({
              type: ServerEventType.STATE_SYNC,
              objectName: 'message',
              objectIDs: { threadID: msg.key.remoteJid!, messageID: mapMessageID(msg.key) },
              mutationType: 'upsert',
              entries: this.mappers.mapMessages([msg]),
            })
          }
        } else if (msg) {
          list.push({
            type: ServerEventType.STATE_SYNC,
            objectName: 'message',
            objectIDs: { threadID: msg.key.remoteJid!, messageID: mapMessageID(msg.key) },
            mutationType: 'update',
            entries: [this.mappers.mapMessagePartial(msg)],
          })
        }
      }
      !!list.length && this.evCallback(list)
    }

    ev.on('connection.update', update => {
      texts.log('connection update:', update)
      const { connection, lastDisconnect } = update

      if (connection) {
        // transactions
        switch (connection) {
          case 'open':
            this.connectionLifetimeTransaction = texts.Sentry.startTransaction({
              name: 'Lifetime',
            })
            if (this.connectionTransaction) {
              texts.log('finished connect transaction')
              this.connectionTransaction!.data = { }
              this.connectionTransaction!.finish()
            }
            break
          case 'connecting':
            texts.log('connect transaction started')
            this.connectionTransaction = texts.Sentry.startTransaction({
              name: 'Connect',
            })
            console.log(this.connectionTransaction)
            break
          case 'close':
            if (this.connectionLifetimeTransaction) {
              this.connectionLifetimeTransaction!.data = {
                reason: lastDisconnect,
              }
              this.connectionLifetimeTransaction!.finish()
            }
            break
        }

        let isReplaced = false
        if (connection === 'close') {
          const { isReconnecting, statusCode } = canReconnect(lastDisconnect?.error)
          isReplaced = statusCode === DisconnectReason.connectionReplaced

          texts.log('disconnected, reconnecting: ', isReconnecting)
          // auto reconnect logic
          if (isReconnecting) {
            update.connection = 'connecting'
            this.connectInternal(2000)
          }
        }

        this.setConnStatus({ status: isReplaced ? ConnectionStatus.CONFLICT : CONNECTION_STATE_MAP[connection] })
      }

      if (typeof update.phoneConnected !== 'undefined') {
        this.setConnStatus({ status: update.phoneConnected ? ConnectionStatus.CONNECTED : ConnectionStatus.DISCONNECTED })
      }
    })

    ev.on('chats.set', () => {
      const now = new Date()
      if (this.lastChatsRecv) {
        const oldTimestamp = this.lastChatsRecv.getTime() / 1000
        const chats = this.store.chats.all()
        const idx = chats.findIndex(c => +c.t <= oldTimestamp)
        if (idx >= 0) {
          chatUpdateEvents(chats.slice(0, idx + 1), 'upsert')
        }
      }
      this.lastChatsRecv = now
    })

    ev.on('chats.upsert', chats => {
      chatUpdateEvents(chats, 'upsert')
    })

    ev.on('presence.update', ({ jid, presences }) => {
      const mapped = this.mappers.mapPresenceUpdate(jid, presences)
      this.evCallback(mapped)
    })

    ev.on('contacts.set', ({ contacts }) => {
      if (this.lastChatsRecv) {
        const events: ServerEvent[] = []
        for (const c of contacts) {
          const chat = this.store.chats.get(c.jid)
          if (!!chat && !chat.name && chat.jid !== STORIES_JID) {
            const title = this.mappers.contactName(c)
            events.push(
              {
                type: ServerEventType.STATE_SYNC,
                objectName: 'thread',
                objectIDs: { threadID: c.jid },
                mutationType: 'update',
                entries: [{ id: c.jid, title }],
              },
            )
          }
        }
        this.evCallback(events)
      }
    })

    ev.on('contacts.upsert', contacts => { })

    ev.on('chats.update', chatUpdateEvents)

    ev.on('chats.delete', entries => {
      this.evCallback([
        {
          type: ServerEventType.STATE_SYNC,
          mutationType: 'delete',
          objectIDs: { },
          objectName: 'thread',
          entries,
        },
      ])
    })

    ev.on('messages.update', messageUpdateEvents)
    ev.on('message-info.update', messageUpdateEvents)

    ev.on('messages.upsert', ({ messages, type }) => {
      const list: ServerEvent[] = []
      if (type === 'notify' || type === 'append') {
        for (const msg of messages) {
          if (msg.key.remoteJid !== STORIES_JID) {
            const mapped = this.mappers.mapMessage(msg)
            if (this.sendingMessageIDs.has(mapped.id)) {
              this.sendingMessageIDs.delete(mapped.id)
            } else {
              list.push({
                type: ServerEventType.STATE_SYNC,
                mutationType: 'upsert',
                objectIDs: { threadID: msg.key.remoteJid as string },
                objectName: 'message',
                entries: [mapped],
              })
            }
          }
        }
      } else if (type === 'last') {
        for (const msg of messages) {
          if (msg.key.remoteJid === STORIES_JID) continue

          const storeList = this.store.messages[msg.key.remoteJid!]
          if (storeList.array.length) {
            list.push({
              type: ServerEventType.STATE_SYNC,
              mutationType: 'delete-all',
              objectName: 'message',
              objectIDs: { threadID: msg.key.remoteJid! },
            })
          }
          list.push({
            type: ServerEventType.STATE_SYNC,
            mutationType: 'upsert',
            objectIDs: { threadID: msg.key.remoteJid! },
            objectName: 'message',
            entries: this.mappers.mapMessages([msg]),
          })
        }
      }
      list.length && this.evCallback(list)
    })

    ev.on('messages.delete', result => {
      const list: ServerEvent[] = []
      if ('ids' in result) {
        list.push({
          type: ServerEventType.STATE_SYNC,
          mutationType: 'delete',
          objectName: 'message',
          objectIDs: { threadID: result.jid },
          entries: result.ids.flatMap(id => (
            [
              mapMessageID({ remoteJid: result.jid, id, fromMe: true }),
              mapMessageID({ remoteJid: result.jid, id, fromMe: false }),
            ]
          )),
        })
      } else {
        list.push({
          type: ServerEventType.STATE_SYNC,
          mutationType: 'delete-all',
          objectName: 'message',
          objectIDs: { threadID: result.jid },
        })
      }
      this.evCallback(list)
    })
  }

  searchUsers = (typed: string) => {
    const contacts = Object.values(this.store.contacts).filter(c => c && !(isGroupID(c.jid) || isBroadcastID(c.jid)))
    const sorted = matchSorter(contacts, typed, { keys: ['name', 'notify', 'jid'] })
    return this.mappers.mapContacts(sorted)
  }

  private loadChat = async (jid: string) => {
    const isGroup = isGroupID(jid)
    await Promise.all([
      (async () => {
        let contact = this.store.contacts[jid]
        if (!contact) {
          contact = { jid }
          this.store.contacts[jid] = contact
        }
        if (!contact.imgUrl) {
          // we're not using asset:// here because Texts cannot yet display the fallback group placeholder on asset 404
          await this.store.fetchImageUrl(jid, this.client).catch(() => null)
        }
      })(),
      (async () => {
        let meta: GroupMetadata
        if (isGroup) {
          meta = await this.store.fetchGroupMetadata(jid, this.client)
        } else if (isBroadcastID(jid)) {
          meta = await this.store.fetchBroadcastListInfo(jid, this.client)
        } else {
          return
        }

        const chat = this.store.chats.get(jid)
        if (!!chat && !chat.read_only) {
          const isSelfAdmin = meta.participants.find(p => p.jid === this.store.state.user?.jid)?.isAdmin
          chat.read_only = (meta.announce !== 'true' || isSelfAdmin) ? 'false' : 'true'
        }
      })(),
    ])
  }

  createThread = async (userIDs: string[], name: string) => {
    let chat: WAChat
    if (userIDs.length > 1) {
      const meta = await this.client!.groupCreate(name, userIDs)
      chat = this.getChat(meta.id)
    } else if (userIDs.length === 1) {
      const jid = whatsappID(userIDs[0])
      chat = this.getChat(jid)
      if (!chat) {
        chat = {
          name,
          jid,
          t: unixTimestampSeconds(),
          count: 0,
        }
      }
    } else throw new Error('no users provided')

    return this.mappers.mapChats([chat])[0]
  }

  deleteThread = async (threadID: string) => {
    await this.client!.modifyChat(threadID, { delete: true })
  }

  getThreads = async (inboxName: InboxName, pagination: PaginationArg): Promise<Paginated<Thread>> => {
    if (inboxName !== InboxName.NORMAL) return { items: [], hasMore: false }
    const { cursor } = pagination || { cursor: null, direction: null }

    while (!this.lastChatsRecv) {
      await delay(50)
    }

    const { chats } = this.store
    const result = chats.paginated(
      cursor || null,
      THREAD_PAGE_SIZE,
      // load all except the stories jid
      k => k.jid !== STORIES_JID,
    )

    await bluebird.all(
      result.map(({ jid }) => this.loadChat(jid)),
    )

    const items = this.mappers.mapChats(result)
    const hasMore = chats.length >= THREAD_PAGE_SIZE

    return {
      items,
      hasMore,
      oldestCursor: result.length ? textsWAKey.key(result.slice(-1)[0]) : undefined,
    }
  }

  // searchMessages = async (typed: string, pagination: PaginationArg, threadID?: string) => {
  //   if (!typed) return { items: [], hasMore: false, oldestCursor: '0' }
  //   const page = cursor ? (+cursor || 1) : 1
  //   const nextPage = (page + 1).toString()
  //   texts.log(`searching for ${typed} in ${threadID}, page: ${page}`)
  //   const response = await this.client.searchMessages(typed, threadID || null, 10, page)
  //   return {
  //     items: mapMessages(response.messages, this.client.user.jid),
  //     hasMore: !response.last,
  //     oldestCursor: nextPage,
  //   }
  // }

  private lazyLoadReadReceipts = async (messages: WAMessage[], threadID: string) => {
    const messageUpdates: Partial<Message> & { id: string }[] = []
    await bluebird.map([...messages], async m => {
      if (m.key.fromMe) {
        await this.store!.fetchMessageInfo(m.key, this.client)
        messageUpdates.push(this.mappers.mapMessagePartial(m))
      }
    })
    if (messageUpdates.length) {
      this.evCallback([{
        type: ServerEventType.STATE_SYNC,
        mutationType: 'update',
        objectIDs: { threadID },
        objectName: 'message',
        entries: messageUpdates,
      }])
    }
  }

  getMessages = async (threadID: string, pagination: PaginationArg) => {
    const cursor = (() => {
      if (!pagination?.cursor) return undefined

      const [id, fromMe] = pagination!.cursor.split('_')
      return { id, fromMe: !!+fromMe }
    })()

    const messages = await this.mutex.mutex(() => {
      const messageStore = this.store.messages[threadID]
      const messageLen = Math.max(
        !!cursor || !messageStore ? MESSAGE_PAGE_SIZE : messageStore?.array.length,
        1,
      )
      return this.store.loadMessages(threadID, messageLen, { before: cursor }, this.client)
    })

    const hasMore = messages.length >= MESSAGE_PAGE_SIZE || !cursor
    if (isGroupID(threadID)) {
      this.lazyLoadReadReceipts(messages, threadID)
    }

    return {
      items: this.mappers.mapMessages(messages),
      hasMore,
    }
  }

  getUser = async ({ phoneNumber }: { phoneNumber: PhoneNumber }) => {
    if (phoneNumber) {
      const jid = phoneNumber.replace(/[^0-9]/g, '') + '@c.us'
      const exists = await this.client!.isOnWhatsApp(jid)
      if (exists) return { id: jid, phoneNumber } as User
    }
  }

  ephemeralOptions = async (jid: string) => {
    if (isGroupID(jid)) {
      const meta = await this.store.fetchGroupMetadata(jid, this.client!)
      if (meta.ephemeralDuration) {
        return { expiration: meta.ephemeralDuration, eph_setting_ts: undefined as any as string }
      }
    } else {
      const chat = this.getChat(jid)
      if (chat && chat.ephemeral) {
        return { expiration: chat.ephemeral, eph_setting_ts: +chat.eph_setting_ts! }
      }
    }
  }

  sendMessage = (threadID: string, msgContent: MessageContent, options?: MessageSendOptions) => (
    this.mutex.mutex(async () => {
      await this.client!.waitForConnection()

      let content: AnyRegularMessageContent
      let { text, mimeType } = msgContent
      let sendAdditionalTextMessage = false

      const opts: MiscMessageGenerationOptions & { waitForAck: boolean } = {
        ephemeralOptions: await this.ephemeralOptions(threadID),
        waitForAck: true,
      }

      msgContent.mentionedUserIDs?.forEach(userID => {
        const phoneNumber = removeServer(userID)
        // @+14151231234 => @14151231234
        text = text!.replace('@+' + phoneNumber, '@' + phoneNumber)
      })
      const buffer = msgContent.fileBuffer || (msgContent.filePath ? { url: msgContent.filePath! } : undefined)

      if (buffer) {
        let media: AnyMediaMessageContent
        if (mimeType?.endsWith('/webp')) media = { sticker: buffer, ...(msgContent.size || {}) }
        else if (mimeType?.includes('video/')) media = { video: buffer, caption: text, gifPlayback: msgContent.isGif, ...(msgContent.size || {}) }
        else if (mimeType?.includes('image/')) media = { image: buffer, caption: text, ...(msgContent.size || {}) }
        else if (mimeType?.includes('audio/')) media = { audio: buffer, pttAudio: mimeType === 'audio/ogg', seconds: msgContent.audioDurationSeconds }
        else media = { document: buffer, fileName: msgContent.fileName, mimetype: '' }

        if (mimeType?.endsWith('/ogg')) {
          mimeType = 'audio/ogg; codecs=opus'
        }

        media.mimetype = mimeType || 'application/octet-stream'
        content = media
        if (!!text && !('caption' in media)) {
          sendAdditionalTextMessage = true
        }
      } else {
        content = {
          text: text!,
          mentions: msgContent.mentionedUserIDs,
        }
      }
      const messages: WAMessage[] = []
      const firstMessageID = generateMessageID()
      this.sendingMessageIDs.add(`${firstMessageID}|1`)
      messages.push(
        await this.client!.sendWAMessage(
          threadID,
          content,
          {
            messageId: firstMessageID,
            quoted: options?.quotedMessageID
              ? await this.store.loadMessage(options.quotedMessageThreadID || threadID, unmapMessageID(options.quotedMessageID).id, this.client)
              : undefined,
            ...opts,
          },
        ),
      )
      if (sendAdditionalTextMessage) {
        const secondMessageID = generateMessageID()
        this.sendingMessageIDs.add(`${secondMessageID}|1`)
        messages.push(
          await this.client!.sendWAMessage(threadID, { text: text! }, {
            messageId: secondMessageID,
            ...opts,
          }),
        )
      }
      return this.mappers.mapMessages(messages)
    })
  )

  forwardMessage = async (threadID: string, messageID: string, threadIDs: string[]) => {
    messageID = unmapMessageID(messageID).id
    const forward = await this.store.loadMessage(threadID, messageID, this.client)
    await bluebird.all(
      threadIDs!.map(
        async tid => (
          this.client!.sendWAMessage(
            tid,
            { forward },
            { waitForAck: true, ephemeralOptions: await this.ephemeralOptions(threadID) },
          )
        ),
      ),
    )
    return true
  }

  deleteMessage = async (threadID: string, messageID: string, forEveryone: boolean) => {
    messageID = unmapMessageID(messageID).id
    const message = await this.store.loadMessage(threadID, messageID, this.client)
    if (forEveryone) {
      await this.client!.sendWAMessage(threadID, { delete: message.key }, {})
    } else {
      await this.client!.modifyChat(
        threadID,
        {
          clear: { messages: [{ id: messageID, fromMe: message.key.fromMe! }] },
        },
      )
    }
    return true
  }

  markAsUnread = async (threadID: string) => {
    const msg = await this.store.mostRecentMessage(threadID, this.client)
    await this.client!.chatRead(msg!.key, -1)
  }

  sendReadReceipt = async (threadID: string, messageID?: string) => {
    await this.client!.waitForConnection()
    messageID = messageID ? unmapMessageID(messageID).id : messageID

    const chat = this.store.chats.get(threadID)
    const count = chat.count < 0 ? 1 : chat.count
    const msg = await (
      messageID
        ? this.store.loadMessage(threadID, messageID, this.client)
        : this.store.mostRecentMessage(threadID, this.client!)
    )
    await this.client!.chatRead(msg!.key, count)
  }

  sendActivityIndicator = async (type: ActivityType, threadID: string) => {
    if (this.client!.getState().connection !== 'open') return
    await this.client!.updatePresence(threadID, PRESENCE_MAP[type])
  }

  updateThread = async (threadID: string, updates: Partial<Thread>) => {
    if ('title' in updates) {
      if (!isGroupID(threadID)) throw new Error('cannot change title of a individual chat')
      await this.client!.groupUpdateSubject(threadID, updates.title!)
    }
    if (typeof updates.messageExpirySeconds !== 'undefined') {
      await this.client!.sendWAMessage(
        threadID,
        { disappearingMessagesInChat: updates.messageExpirySeconds },
        { },
      )
    }
    if ('mutedUntil' in updates) {
      await this.modThread(threadID, updates.mutedUntil === 'forever', 'mute')
    }
    return true
  }

  changeThreadImage = async (threadID: string, imageBuffer: Buffer, mimeType: string) => {
    const chat = this.getChat(threadID)
    if (!chat) new Error('chat not present')

    await this.client!.updateProfilePicture(threadID, imageBuffer)
  }

  archiveThread = (threadID: string, archived: boolean) =>
    this.modThread(threadID, archived, 'archive')

  addParticipant = async (threadID: string, participantID: string) => {
    if (!isGroupID(threadID)) throw new Error('cannot add more participants to a single chat')
    await this.client!.groupParticipantsUpdate(threadID, [participantID], 'add')
    return true
  }

  removeParticipant = async (threadID: string, participantID: string) => {
    if (!isGroupID(threadID)) throw new Error('cannot remove participants from a single chat')
    await this.client!.groupParticipantsUpdate(threadID, [participantID], 'remove')
    return true
  }

  changeParticipantRole = async (threadID: string, participantID: string, role: 'admin' | 'regular') => {
    await this.client!.groupParticipantsUpdate(threadID, [participantID], PARTICIPANT_ACTION_MAP[role])
    return true
  }

  getAsset = async (category: 'profile-picture' | 'attachment', jid: string, msgID: string) => {
    let update: (messages: BaileysEventMap['messages.update']) => void
    switch (category) {
      case 'profile-picture': {
        let url = ''
        const item = this.store.contacts[jid]
        if (!item?.imgUrl || item.imgUrl?.startsWith('asset://')) {
          delete item?.imgUrl
          url = await this.store.fetchImageUrl(jid, this.client)
        }
        return url
      }
      case 'attachment': {
        const m = await this.store.loadMessage(jid, msgID, this.client)
        if (!hasUrl(m)) {
          texts.log('url not present yet for ', m.key, ', waiting...')
          await promiseTimeout(ATTACHMENT_UPDATE_WAIT_TIME_MS, resolve => {
            update = (messages: BaileysEventMap['messages.update']) => {
              for (const message of messages) {
                if (message.key.id === m.key.id) {
                  Object.assign(m, message)
                  if (hasUrl(m)) {
                    resolve()
                  }
                }
              }
            }
            this.client!.ev.on('messages.update', update)
          })
            .finally(() => {
              this.client!.ev.off('messages.update', update)
            })
        }
        const stream = await this.client!.downloadMediaMessage(m, 'stream')
        return stream
      }
      default:
        throw new Error('Unexpected attachment: ' + category)
    }
  }

  onThreadSelected = async (threadID: string) => {
    if (!threadID) {
      return
    }
    const jid = threadID
    // await this.client.updatePresence(jid, Presence.available)
    // update presence when clicking through
    if (!isGroupID(jid) && !isBroadcastID(jid)) {
      await this.client!.requestPresenceUpdate(jid)
        .catch(err => console.error(`error in presence: ${err}`))
    }
  }

  takeoverConflict = async () => {
    this.setConnStatus({ status: ConnectionStatus.CONNECTING })
    await this.connect()
  }

  private async modThread(_threadID: string, value: boolean, key: 'pin' | 'mute' | 'archive') {
    const threadID = whatsappID(_threadID)
    const chat = this.getChat(threadID)
    if (!chat) throw new Error('modThread: thread not found')

    if (!!chat[key] === value) return // already done, nothing to do
    let mod: ChatModification
    switch (key) {
      case 'archive':
        mod = { archive: value }
        break
      case 'pin':
        mod = { pin: value ? true : { remove: +chat.pin! } }
        break
      case 'mute':
        mod = { mute: value ? CHAT_MUTE_DURATION_S : { remove: +chat.mute! } }
        break
    }
    await this.client!.modifyChat(threadID, mod)
  }

  private ppUrl = (jid: string) => `asset://${this.accountID}/profile-picture/${jid}`

  private getChat = (jid: string) => this.store.chats.get(jid)
}
