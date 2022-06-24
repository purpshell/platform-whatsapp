import { areJidsSameUser, extractMessageContent, getContentType, jidNormalizedUser, MessageUserReceipt, normalizeMessageContent, STORIES_JID, toNumber, updateMessageWithReceipt, WAMessage, WAMessageStatus, WAMessageStubType, WAProto } from '@adiwajshing/baileys'
import type { Message, MessageAction, MessageAttachment, MessageBehavior, MessageButton, MessageLink, MessagePreview, MessageReaction, TextAttributes } from '@textshq/platform-sdk'
import { Column, Entity, Index, PrimaryColumn } from 'typeorm'
import { serialize, deserialize } from 'v8'
import type { FullBaileysMessage, MappingContext } from '../types'
import { isHiddenMessage, mapMessageID, safeJSONStringify } from '../utils/generics'
import { mapTextAttributes } from '../utils/text-attributes'
import BufferJSONEncodedColumn from './BufferJSONEncodedColumn'
import { isPaymentMessage, getNotificationType, mapMessageQuoted, messageAction, messageAttachments, messageButtons, messageHeading, messageLink, messageStatus, messageStubText, messageText, mapMessageSeen, mapMessageReactions, getKeyAuthor, messageFooter } from './DBMessage-util'

@Entity()
@Index('fetch_idx', ['threadID', 'orderKey'])
export default class DBMessage implements Message {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  threadID: string

  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string

  @Column({ type: 'datetime', nullable: false })
  timestamp: Date

  @Column({ type: 'int', unsigned: true, nullable: true })
  expiresInSeconds?: number

  @Column({ type: 'int', unsigned: true, nullable: true })
  forwardedCount?: number

  @Column({ type: 'varchar', length: 64 })
  senderID: 'none' | '$thread' | string

  @Column({ type: 'boolean', nullable: false })
  isSender: boolean

  @Column({ type: 'text', nullable: true })
  text?: string

  @Column({ type: 'text', nullable: true })
  textHeading?: string

  @Column({ ...BufferJSONEncodedColumn, nullable: false, default: '[]' })
  attachments: MessageAttachment[]

  @Column({ type: 'simple-json', nullable: false, default: '[]' })
  links: MessageLink[]

  @Column({ type: 'simple-json', nullable: false, default: 'false' })
  seen?: { [_: string]: Date } | boolean

  @Column({ type: 'boolean', nullable: false })
  isDeleted: boolean

  @Column({ type: 'simple-json', nullable: false, default: '[]' })
  buttons: MessageButton[]

  @Column({ type: 'boolean', nullable: false, default: false })
  parseTemplate: boolean

  @Column({ type: 'simple-json', nullable: true })
  linkedMessage?: MessagePreview

  @Column({ type: 'simple-json', nullable: true })
  action?: MessageAction

  @Column({ type: 'simple-json', nullable: true })
  reactions?: MessageReaction[]

  @Column({ type: 'boolean', nullable: false, default: false })
  isAction: boolean

  @Column({
    type: 'blob',
    transformer: {
      from: (buff: Buffer | null) => {
        const result = buff ? deserialize(buff) : undefined
        if (result) {
          result.message = WAProto.WebMessageInfo.decode(result.message)
        }

        return result
      },
      to: (item: FullBaileysMessage | null) => {
        if (item) {
          return serialize({ ...item, message: WAProto.WebMessageInfo.encode(item.message).finish() })
        }
        return null
      },
    },
  })
  original: FullBaileysMessage

  @Column({ type: 'int', nullable: false, unique: true })
  orderKey: number

  @Column({ type: 'varchar', length: 64, nullable: true, default: null })
  behavior?: MessageBehavior

  @Column({ type: 'boolean', default: false, nullable: false })
  isHistoryMessage: boolean

  @Column({ type: 'boolean', default: false, nullable: false })
  isHidden?: boolean | undefined

  @PrimaryColumn({ type: 'varchar', length: 64 })
  linkedMessageThreadID?: string

  @PrimaryColumn({ type: 'varchar', length: 64 })
  linkedMessageID?: string

  cursor?: string

  _original?: string

  textAttributes?: TextAttributes

  textFooter?: string

  shouldFireEvent?: boolean

  static prepareForSending<T extends Partial<DBMessage>>(item: T, accountID: string): T {
    item = { ...item }
    if (item.text) {
      const { text, textAttributes } = mapTextAttributes(
        item.text,
        // add parenthesis so Texts can map id => name
        id => (id.startsWith('{{') ? id : `{{${id}}}`),
      )!
      if (textAttributes) {
        item.text = text
        item.textAttributes = textAttributes
      }
    }
    if (item.original) {
      item._original = JSON.stringify(item.original)
    }

    if (typeof item.seen === 'object' && item.seen) {
      for (const key in item.seen) {
        if (typeof item.seen[key] === 'string') {
          item.seen[key] = new Date(item.seen[key])
        }
      }
    }

    if (typeof item.orderKey !== 'undefined') {
      item.cursor = item.orderKey?.toString()
    }

    delete item.original
    delete item.isHistoryMessage

    return item
  }

  update(partial: Partial<WAMessage>, ctx: MappingContext) {
    if (!this.isSender && partial.status === WAProto.WebMessageInfo.WebMessageInfoStatus.READ) {
      this.original.seenByMe = true
    }
    // we do not want to update timestamps
    // when messages are decrypted after failures
    if (partial.messageTimestamp && this.original.message.messageStubType === WAMessageStubType.CIPHERTEXT) {
      partial = { ...partial }
      delete partial.messageTimestamp
    }
    Object.assign(this.original.message, partial)
    this.mapFromOriginal(ctx)
  }

  updateFromReceipt(receipt: MessageUserReceipt, ctx: MappingContext) {
    updateMessageWithReceipt(this.original.message, receipt)

    if (!this.isSender && areJidsSameUser(receipt.userJid, ctx.meID || '') && receipt.readTimestamp) {
      this.original.seenByMe = true
    }

    this.mapFromOriginal(ctx)
  }

  updateWithReaction(reaction: WAProto.IReaction, operation: 'add' | 'remove', ctx: MappingContext) {
    const authorID = getKeyAuthor(reaction.key, ctx.meID || '')

    let reactions = this.original.message.reactions || []
    reactions = reactions.filter(r => getKeyAuthor(r.key, ctx.meID!) !== authorID)
    if (operation === 'add') {
      reactions.push(reaction)
    }

    this.original.message.reactions = reactions

    this.mapFromOriginal(ctx)
  }

  mapFromOriginal(ctx: MappingContext) {
    const { message } = this.original

    const threadID = message.key.remoteJid || ''
    if (!threadID) {
      ctx.logger.warn({ key: message.key }, 'got msg with no thread')
    }

    const currentUserID = ctx.meID || ''
    let id = mapMessageID(message.key)
    // ensure we don't overwrite the ID ever
    if (id !== this.id && !!this.id) {
      id = this.id
    }
    const messageContent = extractMessageContent(message.message)
    const messageType = getContentType(messageContent)
    const messageInner = messageType && messageContent ? messageContent[messageType] : undefined

    const contextInfo = typeof messageInner === 'object' && messageInner && ('contextInfo' in messageInner) ? messageInner.contextInfo : undefined

    let senderID = message.key.fromMe ? currentUserID : (message.participant || message.key.participant || message.key.remoteJid!)
    senderID = jidNormalizedUser(senderID)

    const stubBasedMessage = messageStubText(message)
    const { attachments } = messageAttachments(messageContent!, messageInner, message.key.remoteJid!, id)
    const timestamp = toNumber(message.messageTimestamp!) * 1000

    const linked = mapMessageQuoted(messageInner, message.key.remoteJid!, currentUserID)
    const link = messageLink(messageContent!)
    const action = messageAction(message)
    const isDeleted = message.messageStubType === WAMessageStubType.REVOKE

    const protocolMessageType = (message?.message?.ephemeralMessage?.message || message?.message)?.protocolMessage?.type
    const isHistoryMessage = protocolMessageType === WAProto.ProtocolMessage.ProtocolMessageType.HISTORY_SYNC_NOTIFICATION
    const isAction = !!(
      (
        stubBasedMessage
        && ![WAMessageStubType.REVOKE, WAMessageStubType.CIPHERTEXT].includes(message.messageStubType!)
      )
      || typeof protocolMessageType !== 'undefined'
    )

    const mapped: Message = {
      _original: safeJSONStringify(message),
      id,
      threadID,
      textHeading: [...messageHeading(message)].join('\n'),
      text: isDeleted ? 'This message has been deleted.' : (messageText(messageContent!, messageInner) ?? stubBasedMessage),
      textFooter: messageFooter(message),
      timestamp: new Date(timestamp),
      forwardedCount: contextInfo?.forwardingScore || undefined,
      senderID,
      isSender: !!message.key.fromMe,
      isDeleted,
      attachments,
      buttons: message.message ? messageButtons(normalizeMessageContent(message.message), message.key) : [],
      isDelivered: message.key.fromMe ? messageStatus(message.status!) >= WAMessageStatus.SERVER_ACK : true,
      linkedMessage: linked,
      links: link ? [link] : undefined,
      parseTemplate: isAction || !!(contextInfo?.mentionedJid) || isPaymentMessage(message.message!) || !!messageContent?.reactionMessage,
      isAction,
      action,
      // todo: review logic, this is incorrect:
      // isErrored: !isAction && message.key.fromMe && message.status === 0,
      behavior: getNotificationType(message, currentUserID),
      expiresInSeconds: contextInfo?.expiration || undefined,
      seen: message.key.fromMe ? mapMessageSeen(message) : {},
      reactions: message.reactions ? mapMessageReactions(message.reactions, ctx.meID!) : undefined,
      isHidden: isHiddenMessage(message),
    }

    if (STORIES_JID !== linked?.threadID) {
      mapped.linkedMessageID = linked?.id
      mapped.linkedMessageThreadID = linked?.threadID
    }

    Object.assign(this, mapped)
    this.isHistoryMessage = isHistoryMessage
  }
}
