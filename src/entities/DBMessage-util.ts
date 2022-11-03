import { areJidsSameUser, ButtonReplyInfo, extractMessageContent, getContentType, isJidGroup, jidDecode, jidNormalizedUser, MessageType, normalizeMessageContent, toNumber, unixTimestampSeconds, WAContextInfo, WAGenericMediaMessage, WAMessage, WAMessageContent, WAMessageKey, WAMessageStatus, WAMessageStubType, WAProto, shouldIncrementChatUnread, isRealMessage } from '@adiwajshing/baileys'
import { MessageAction, MessageActionType, Attachment, AttachmentType, MessageBehavior, MessageButton, MessageLink, MessagePreview, MessageReaction, MessageSeen } from '@textshq/platform-sdk'
import { attachmentUrl, getDataURIFromBuffer, mapMessageID } from '../utils/generics'
import { MENTION_START_TOKEN, MENTION_END_TOKEN } from '../utils/text-attributes'

const participantAdded = (message: WAMessage) =>
  (message.participant
    ? `{{${jidNormalizedUser(message.participant)}}} added ${message.messageStubParameters!.map(p => `{{${jidNormalizedUser(p)}}}`).join(', ')} to this group`
    : `${message.messageStubParameters!.map(p => `{{${jidNormalizedUser(p)}}}`).join(', ')} was added to this group`)

const numberToBigInt = (number: number | Long) => BigInt(number.toString())

const isExpiredInvite = (invite: WAProto.Message.IGroupInviteMessage) => {
  const expirationS = toNumber(invite.inviteExpiration!) || 0
  return expirationS < unixTimestampSeconds()
}

const getEphemeralMessageSettingChangedText = (exp: number, actor: string) => {
  if (exp) {
    const expDays = Math.floor(exp / (60 * 60 * 24))
    return actor
      ? `{{${actor}}} has turned on disappearing messages. New messages will disappear from this chat after ${expDays} days.`
      : `Disappearing messages were turned on. New messages will disappear from this chat after ${expDays} days.`
  }
  return actor
    ? `{{${actor}}} turned off disappearing messages`
    : 'Disappearing messages were turned off'
}

const getDisappearingModeMessageText = (exp: number, actor: string) => {
  const expDays = Math.floor(exp / (60 * 60 * 24))
  // TODO: change to "You use" when self and make "X days" more granular / human friendly
  return `{{${actor}}} uses a default timer for disappearing messages in new chats. All new messages will disappear from this chat ${expDays} days after they're sent.`
}

const PRE_DEFINED_MESSAGES: { [k: number]: string | ((m: WAMessage) => string) } = {
  [WAMessageStubType.CIPHERTEXT]: '⌛️ Waiting for this message. This may take a while.',

  [WAMessageStubType.E2E_ENCRYPTED]: '🔒 Messages you send to this chat and calls are secured with end-to-end encryption',
  [WAMessageStubType.E2E_ENCRYPTED_NOW]: '🔒 Messages you send to this chat and calls are now secured with end-to-end encryption',
  // This chat is with the official business account of "X". Click for more info.
  // [AFTER CLICK] WhatsApp has verified that this is the official business account of "X".
  [WAMessageStubType.BIZ_INTRO_BOTTOM]: 'This chat is with an official business account',
  [WAMessageStubType.BIZ_INTRO_TOP]: 'This chat is with an official business account',
  // This chat is with the official business account of "X". Click for more info.
  [WAMessageStubType.BIZ_TWO_TIER_MIGRATION_TOP]: 'This chat is with an official business account',
  // X registered as a business account, but WhatsApp hasn’t verified their name yet.
  [WAMessageStubType.BIZ_TWO_TIER_MIGRATION_BOTTOM]: 'This chat is with a business account',
  [WAMessageStubType.BLUE_MSG_SELF_PREMISE_UNVERIFIED]: 'This chat is with a business account',
  // This account was previously a business account but has now registered as a standard account and may no longer belong to the business.
  [WAMessageStubType.BIZ_MOVE_TO_CONSUMER_APP]: 'This business account has now registered as a standard account',
  // This chat is with the verified business account for "X". Click for more info.
  // [AFTER CLICK] WhatsApp has made changes to the business account types. "Verified Business" will now be labeled as "Official Business Account".
  [WAMessageStubType.VERIFIED_HIGH]: 'This chat is with a verified business account',

  [WAMessageStubType.CALL_MISSED_VIDEO]: 'Missed video call',
  [WAMessageStubType.CALL_MISSED_VOICE]: 'Missed voice call',
  [WAMessageStubType.CALL_MISSED_GROUP_VIDEO]: 'Missed group video call',
  [WAMessageStubType.CALL_MISSED_GROUP_VOICE]: 'Missed group voice call',

  [WAMessageStubType.GROUP_PARTICIPANT_PROMOTE]: '{{{{0}}}} is now an admin',
  [WAMessageStubType.GROUP_PARTICIPANT_DEMOTE]: '{{{{0}}}} is no longer an admin',

  [WAMessageStubType.GROUP_CREATE]: '{{sender}} created this group',
  [WAMessageStubType.GROUP_DELETE]: 'This chat has been closed',
  [WAMessageStubType.GROUP_CHANGE_INVITE_LINK]: '{{sender}} revoked this group\'s invite link',
  [WAMessageStubType.BROADCAST_CREATE]: '{{sender}} created this broadcast list',
  [WAMessageStubType.BROADCAST_REMOVE]: '{{sender}} was removed from this broadcast list',
  [WAMessageStubType.BROADCAST_ADD]: '{{sender}} was added to this broadcast list',

  [WAMessageStubType.E2E_IDENTITY_CHANGED]: '{{{{0}}}}\'s security code changed',
  [WAMessageStubType.E2E_DEVICE_CHANGED]: '{{{{0}}}}\'s security code changed',
  [WAMessageStubType.E2E_IDENTITY_UNAVAILABLE]: 'Security code notifications are no longer available for this chat',
  [WAMessageStubType.BIZ_PRIVACY_MODE_INIT_BSP]: 'This business works with other companies to manage this chat',
  [WAMessageStubType.BIZ_PRIVACY_MODE_TO_BSP]: 'This business is now working with other companies to manage this chat',
  [WAMessageStubType.BIZ_PRIVACY_MODE_INIT_FB]: 'This business uses a secure service from the Facebook company to manage this chat',
  [WAMessageStubType.BIZ_PRIVACY_MODE_TO_FB]: 'This business is now using a secure service from the Facebook company to manage this chat',
  [WAMessageStubType.GENERIC_NOTIFICATION]: '{{0}}',

  [WAMessageStubType.GROUP_PARTICIPANT_ADD]: participantAdded,
  [WAMessageStubType.GROUP_PARTICIPANT_ADD_REQUEST_JOIN]: participantAdded,

  [WAMessageStubType.PAYMENT_ACTION_SEND_PAYMENT_INVITATION]: '{{sender}} notified {{{{0}}}} that you are trying to send a payment',
  // todo: [WAMessageStubType.PAYMENT_ACTION_SEND_PAYMENT_REMINDER]: unknown

  [WAMessageStubType.INDIVIDUAL_CHANGE_NUMBER]: message => `{{${message.key.remoteJid}}} changed their phone number to a new number {{{{0}}}}`,
  [WAMessageStubType.GROUP_PARTICIPANT_CHANGE_NUMBER]: '{{sender}} changed their phone number to a new number {{{{0}}}}',
  [WAMessageStubType.CHANGE_EPHEMERAL_SETTING]: message => getEphemeralMessageSettingChangedText(+message.messageStubParameters![0], message.messageStubParameters![1]),
  [WAMessageStubType.DISAPPEARING_MODE]: message => getDisappearingModeMessageText(+message.messageStubParameters![0], message.messageStubParameters![1]),

  [WAMessageStubType.GROUP_CHANGE_DESCRIPTION]: '{{sender}} changed the group description',
  [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]: '{{sender}} removed {{{{0}}}} from this group',
  [WAMessageStubType.GROUP_CHANGE_SUBJECT]: '{{sender}} changed the group subject to "{{0}}"',
  [WAMessageStubType.GROUP_CHANGE_ICON]: '{{sender}} changed this group\'s icon',
  [WAMessageStubType.GROUP_PARTICIPANT_INVITE]: '{{sender}} joined using this group\'s invite link',

  [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]: message =>
    `${message.messageStubParameters!.map(p => `{{${p}}}`).join(', ')} left`,
  [WAMessageStubType.GROUP_CHANGE_RESTRICT]: message => {
    if (message.messageStubParameters![0] === 'on') return '{{sender}} changed this group\'s settings to allow only admins to edit this group\'s info'
    return '{{sender}} changed this group\'s settings to allow all participants to edit this group\'s info'
  },
  [WAMessageStubType.GROUP_CHANGE_ANNOUNCE]: message => {
    if (message.messageStubParameters![0] === 'on') return '📢 {{sender}} changed this group\'s settings to allow only admins to send messages to this group'
    return '📢 {{sender}} changed this group\'s settings to allow all participants to send messages to this group'
  },
  [WAMessageStubType.BLOCK_CONTACT]: message =>
    (message.messageStubParameters![0] ? 'You blocked this contact' : 'You unblocked this contact'),
}

const NOTIFYING_STUB_TYPES = new Set([WAMessageStubType.GROUP_PARTICIPANT_ADD])

const ATTACHMENT_MAP = {
  audioMessage: AttachmentType.AUDIO,
  imageMessage: AttachmentType.IMG,
  stickerMessage: AttachmentType.IMG,
  videoMessage: AttachmentType.VIDEO,
} as { [T in MessageType]: AttachmentType }

const MESSAGE_ACTION_MAP = {
  [WAMessageStubType.GROUP_PARTICIPANT_ADD]: MessageActionType.THREAD_PARTICIPANTS_ADDED,
  [WAMessageStubType.GROUP_PARTICIPANT_INVITE]: MessageActionType.THREAD_PARTICIPANTS_ADDED,
  [WAMessageStubType.GROUP_PARTICIPANT_ADD_REQUEST_JOIN]: MessageActionType.THREAD_PARTICIPANTS_ADDED,
  [WAMessageStubType.GROUP_PARTICIPANT_REMOVE]: MessageActionType.THREAD_PARTICIPANTS_REMOVED,
  [WAMessageStubType.GROUP_PARTICIPANT_LEAVE]: MessageActionType.THREAD_PARTICIPANTS_REMOVED,
  [WAMessageStubType.GROUP_CREATE]: MessageActionType.GROUP_THREAD_CREATED,
  // [WAMessageStubType.GROUP_CHANGE_DESCRIPTION]: ,
  [WAMessageStubType.GROUP_CHANGE_SUBJECT]: MessageActionType.THREAD_TITLE_UPDATED,
}

const PAYMENT_STATUS_MAP = {
  [WAProto.PaymentInfo.Status.UNKNOWN_STATUS]: 'Unknown status',
  [WAProto.PaymentInfo.Status.PROCESSING]: 'Processing',
  [WAProto.PaymentInfo.Status.SENT]: 'Sent',
  [WAProto.PaymentInfo.Status.NEED_TO_ACCEPT]: 'Needs to accept',
  [WAProto.PaymentInfo.Status.COMPLETE]: 'Completed',
  [WAProto.PaymentInfo.Status.COULD_NOT_COMPLETE]: 'Could not complete',
  [WAProto.PaymentInfo.Status.REFUNDED]: 'Refunded',
  [WAProto.PaymentInfo.Status.EXPIRED]: 'Expired',
  [WAProto.PaymentInfo.Status.REJECTED]: 'Rejected',
  [WAProto.PaymentInfo.Status.CANCELLED]: 'Cancelled',
  [WAProto.PaymentInfo.Status.WAITING_FOR_PAYER]: 'Waiting for payer',
  [WAProto.PaymentInfo.Status.WAITING]: 'Waiting',
}

export const getKeyAuthor = (key: WAMessageKey | undefined | null, meID: string) => (
  (key?.fromMe ? meID : key?.participant || key?.remoteJid) || ''
)

export const mapMessageReactions = (reactions: WAProto.IReaction[], meID: string): MessageReaction[] =>
  reactions.map<MessageReaction>(reaction => {
    const participantID = getKeyAuthor(reaction.key, meID)
    return {
      id: participantID,
      reactionKey: reaction.text || '',
      participantID,
      emoji: true,
    }
  })

export const mapMessageSeen = (message: WAMessage): MessageSeen => {
  if (message.status! >= WAMessageStatus.READ) {
    return true
  }

  if (isJidGroup(message.key.remoteJid || '')) {
    const seenMap: MessageSeen = {}
    for (const { userJid, readTimestamp } of message.userReceipt || []) {
      const readUnixStamp = toNumber(readTimestamp || 0)
      if (readUnixStamp) {
        seenMap[userJid] = new Date(readUnixStamp * 1000)
      }
    }
    return seenMap
  }

  return false
}

export const mapMessageQuoted = (messageInner: any, chatId: string, currentUserId: string): MessagePreview | undefined => {
  if (messageInner) {
    const contextInfo = messageInner?.contextInfo as WAContextInfo
    let quoted = contextInfo?.quotedMessage
    if (quoted) {
      // in case quoted is ephemeral
      quoted = normalizeMessageContent(quoted)
      chatId = contextInfo.remoteJid! || chatId
      const preview: MessagePreview = {
        id: mapMessageID({ id: contextInfo.stanzaId!, fromMe: areJidsSameUser(contextInfo.participant!, currentUserId) }),
        threadID: jidNormalizedUser(chatId),
        senderID: jidNormalizedUser(contextInfo.participant || chatId),
      }

      const text = messageText(quoted!)
      if (text) {
        preview.text = text
      }

      const { attachments } = messageAttachments(quoted!, preview.threadID!, preview.id!)
      if (attachments.length) {
        preview.attachments = attachments
      }

      return preview
    }
  }
}

export const isPaymentMessage = (m: WAProto.IMessage) =>
  !!(m?.sendPaymentMessage || m?.requestPaymentMessage || m?.cancelPaymentRequestMessage || m?.declinePaymentRequestMessage)

export function messageStatus(status: number | string) {
  if (typeof status === 'string') {
    const key = Object.keys(WAMessageStatus).find(k => k === status)
    return WAMessageStatus[key!]
  }
  return status
}

export function messageAction(message: WAMessage): MessageAction | undefined {
  const content = message.message ? normalizeMessageContent(message.message) : undefined
  if (content?.reactionMessage) {
    return {
      type: content.reactionMessage?.text ? MessageActionType.MESSAGE_REACTION_CREATED : MessageActionType.MESSAGE_REACTION_DELETED,
    }
  }

  const actionType = MESSAGE_ACTION_MAP[message.messageStubType!]
  const actorParticipantID = message.participant || message.key.participant || ''
  if (!actionType) return
  if (actionType === MessageActionType.THREAD_TITLE_UPDATED) {
    return {
      type: actionType,
      title: message.messageStubParameters![0],
      actorParticipantID,
    }
  }
  if (actionType === MessageActionType.GROUP_THREAD_CREATED) {
    return {
      type: actionType,
      title: message.messageStubParameters![0],
      actorParticipantID,
    }
  }
  return {
    type: actionType,
    participantIDs: message.messageStubParameters
      ? message.messageStubParameters.map(p => p)
      : [actorParticipantID],
    actorParticipantID,
  }
}

export function getNotificationType(message: WAMessage, currentUserId: string) {
  if (message.key.fromMe) { // no flag for fromMe messages
    return null
  }

  const incrementReadCounter = shouldIncrementChatUnread(message)
  const isRealMsg = isRealMessage(message, currentUserId)
  if (!isRealMsg) {
    return MessageBehavior.SILENT
  }

  if (!incrementReadCounter) {
    return MessageBehavior.KEEP_READ
  }

  if (message.broadcast) {
    return MessageBehavior.DONT_NOTIFY
  }

  return null
}

export function messageAttachments(message: WAMessageContent, jid: string, id: string): { attachments: Attachment[], media: boolean } {
  const response = { attachments: [] as Attachment[], media: false }
  if (!message) return response

  const messageInner = Object.values(extractMessageContent(message)!)[0]

  if (message.contactMessage || message.contactsArrayMessage) {
    const contacts = message.contactsArrayMessage?.contacts || [message.contactMessage]
    response.attachments = contacts.map<Attachment>(c => ({
      id: `${id}_${c!.displayName}`,
      type: AttachmentType.UNKNOWN,
      data: Buffer.from(c!.vcard!, 'utf-8'),
      fileName: `${c!.displayName}.vcf`,
    }))
  } else if (message.audioMessage || message.imageMessage || message.documentMessage || message.videoMessage || message.stickerMessage) {
    const messageType = getContentType(message)!
    const jpegThumbnail = (message.videoMessage || message.imageMessage)?.jpegThumbnail
    const fileName = message.documentMessage?.fileName
    const content = message[messageType] as WAGenericMediaMessage

    let fileSize: number | undefined
    if ('fileLength' in content && !!content.fileLength) {
      fileSize = toNumber(content.fileLength)
    }

    const size = message.stickerMessage ? { width: 100, height: 100 } : { width: messageInner?.width, height: messageInner?.height }
    response.attachments = [{
      id,
      size: (size.width && size.height) ? size : undefined,
      type: ATTACHMENT_MAP[messageType] || AttachmentType.UNKNOWN,
      isGif: !!message.videoMessage?.gifPlayback,
      isSticker: message.stickerMessage ? true : undefined,
      mimeType: messageInner.mimetype,
      posterImg: jpegThumbnail ? `data:;base64,${Buffer.from(jpegThumbnail).toString('base64')}` : undefined,
      srcURL: attachmentUrl(undefined, jid, id, fileName || ''),
      fileName: fileName || undefined,
      fileSize,
      isVoiceNote: message.audioMessage?.ptt || undefined,
    }]
    response.media = true
  } else if (message.productMessage?.product?.productImage) {
    const img = message.productMessage?.product?.productImage
    const jpegThumbnail = img?.jpegThumbnail
    response.attachments = [
      {
        id,
        type: AttachmentType.IMG,
        srcURL: attachmentUrl(undefined, jid, id, ''),
        mimeType: img.mimetype!,
        posterImg: jpegThumbnail ? `data:;base64,${Buffer.from(jpegThumbnail).toString('base64')}` : undefined,
      },
    ]
    response.media = true
  }
  return response
}

export function messageFooter(message: WAMessage) {
  let footer: string | undefined
  const content = message.message ? normalizeMessageContent(message.message) : undefined
  const template = content?.templateMessage?.hydratedTemplate
  if (content?.groupInviteMessage) {
    if (isExpiredInvite(content.groupInviteMessage)) {
      footer = 'Invite expired'
    }
  } else if (message.status === WAMessageStatus.PLAYED) {
    footer = 'Played'
  } else if (template) {
    footer = template?.hydratedFooterText || undefined
  }

  return footer
}

export function* messageHeading(message: WAMessage) {
  if (message.broadcast) yield 'Broadcast'
  const m = message.message ? normalizeMessageContent(message.message) : undefined
  if (m) {
    const { paymentInfo } = message
    if (isPaymentMessage(m) && paymentInfo) {
      const amount = `${paymentInfo.currency} ${numberToBigInt(paymentInfo.amount1000!) / BigInt(1000)}`
      const status = PAYMENT_STATUS_MAP[paymentInfo.status!]
      if (m.sendPaymentMessage) {
        yield `💵 Payment to {{${paymentInfo.receiverJid}}} | ${amount} | ${status}`
      }
      if (m.requestPaymentMessage) {
        yield `💵 Payment requested from {{${m.requestPaymentMessage.requestFrom}}} | ${amount} | ${status}`
      }
      if (m.declinePaymentRequestMessage) {
        yield `💵 Payment requested from {{${m.requestPaymentMessage!.requestFrom}}} declined ${amount} | ${status}`
      }
      if (m.cancelPaymentRequestMessage) {
        yield `💵 Payment requested from {{${m.requestPaymentMessage!.requestFrom}}} canceled ${amount} | ${status}`
      }
    }
    if (m.groupInviteMessage) yield `${m.groupInviteMessage.groupName} | WhatsApp Group Invite`
    if (m.locationMessage) yield '📍 Location'
    if (m.liveLocationMessage) yield '📍 Live Location'
    if (m.productMessage?.product) yield '📦 Product'
  }
}

const replaceJids = (jids: string[], text: string) => {
  if (!jids) return text
  return jids.reduce((txt, jid) => txt.replace(`@${jidDecode(jid)!.user}`, `${MENTION_START_TOKEN}${jid}${MENTION_END_TOKEN}`), text)
}

const generateDeepLink = (type: 'template' | 'plain', key: WAMessageKey, button: ButtonReplyInfo) => {
  const searchParams = new URLSearchParams({
    type,
    buttonId: button.id,
    buttonDisplayText: button.displayText,
    buttonIndex: button.index,
    ...key,
  } as any)
  return `texts://platform-callback/$accountID/callback/button?${searchParams.toString()}`
}

const generateDeepLinkForGroupJoin = (senderJid: string, invite: WAProto.Message.IGroupInviteMessage) => {
  const searchParams = new URLSearchParams({ senderJid, jid: invite.groupJid!, inviteCode: invite.inviteCode!, expiration: invite.inviteExpiration!.toString() })
  return `texts://platform-callback/$accountID/callback/group?${searchParams.toString()}`
}

export function messageButtons(message: WAMessageContent, key: WAMessageKey) {
  const buttons: MessageButton[] = []
  if (message?.templateMessage) {
    const template = message.templateMessage.hydratedTemplate || message.templateMessage.hydratedFourRowTemplate
    template?.hydratedButtons?.forEach((button, index) => {
      if (button.callButton) {
        buttons.push({
          label: button.callButton.displayText!,
          linkURL: 'tel:' + button.callButton.phoneNumber,
        })
      }
      if (button.quickReplyButton) {
        const btn: ButtonReplyInfo = {
          id: button.quickReplyButton!.id!,
          displayText: button.quickReplyButton!.displayText!,
          index,
        }
        buttons.push({
          label: button.quickReplyButton.displayText!,
          linkURL: generateDeepLink('template', key, btn),
        })
      }
      if (button.urlButton) {
        buttons.push({
          label: button.urlButton.displayText!,
          linkURL: button.urlButton.url!,
        })
      }
    })
  } else if (message?.buttonsMessage?.buttons?.length) {
    for (const button of message.buttonsMessage.buttons) {
      const btn: ButtonReplyInfo = {
        id: button.buttonId!,
        displayText: button.buttonText!.displayText!,
        index: 0,
      }
      buttons.push({
        label: button.buttonText!.displayText!,
        linkURL: generateDeepLink('plain', key, btn),
      })
    }
  } else if (message?.groupInviteMessage?.groupJid) {
    if (!isExpiredInvite(message.groupInviteMessage) && !key.fromMe) {
      buttons.push({
        label: 'Join Group',
        linkURL: generateDeepLinkForGroupJoin(key.remoteJid!, message.groupInviteMessage),
      })
    }
  }

  return buttons
}

const ProtocolMessageType = WAProto.Message.ProtocolMessage.Type

export function messageText(message: WAMessageContent | undefined) {
  switch (message?.protocolMessage?.type) {
    case ProtocolMessageType.EPHEMERAL_SETTING: {
      const exp = message.protocolMessage.ephemeralExpiration
      return getEphemeralMessageSettingChangedText(exp!, 'sender')
    }
    case ProtocolMessageType.HISTORY_SYNC_NOTIFICATION:
      return 'Chat History Synced'
    case ProtocolMessageType.APP_STATE_SYNC_KEY_SHARE:
      return 'App State Key Shared'
    case ProtocolMessageType.APP_STATE_SYNC_KEY_REQUEST:
      return 'App State Key Requested'
    case ProtocolMessageType.INITIAL_SECURITY_NOTIFICATION_SETTING_SYNC:
      return '🔒 Messages you send to this chat and calls are secured with end-to-end encryption'
    default:
      break
  }

  const paymentMessage = message?.sendPaymentMessage || message?.requestPaymentMessage || message?.cancelPaymentRequestMessage || message?.declinePaymentRequestMessage
  if (paymentMessage) {
    if ('noteMessage' in paymentMessage) {
      const etm = paymentMessage?.noteMessage?.extendedTextMessage
      const note = etm?.text
      const jids = etm?.contextInfo?.mentionedJid
      if (note) return replaceJids(jids!, note)
    }
  }
  const loc = message?.locationMessage || message?.liveLocationMessage
  if (loc) {
    return [message?.locationMessage?.address, message?.liveLocationMessage?.caption].filter(Boolean).join('\n')
  }
  const product = message?.productMessage?.product
  if (product) {
    const price = typeof product.priceAmount1000 === 'number' ? +product.priceAmount1000 : product.priceAmount1000!.low
    return [
      product.title,
      product.description,
      `${product.currencyCode} ${(price / 1000)}`,
      product.productId,
    ]
      .filter(Boolean)
      .join('\n')
  }

  if (message?.reactionMessage) {
    const reactedKey = message.reactionMessage.key
    const sender = reactedKey?.fromMe ? 'your' : `{{${reactedKey?.participant || reactedKey!.remoteJid}}}'s`
    return `{{sender}} reacted ${message.reactionMessage!.text!} to ${sender} message`
  }

  const type = getContentType(message)!
  const messageInner = message?.[type] as any

  const text = messageInner?.text ?? messageInner?.caption
  if (text) {
    return replaceJids(messageInner?.contextInfo?.mentionedJid, text)
  }
  if (message?.templateMessage || message?.highlyStructuredMessage) {
    const templateMsg = message.templateMessage || message?.highlyStructuredMessage?.hydratedHsm
    const txt = (templateMsg?.hydratedTemplate || templateMsg?.hydratedFourRowTemplate)?.hydratedContentText
    if (txt) return txt
  }
  if (message?.buttonsMessage) {
    return message?.buttonsMessage?.contentText
  }
  if (message?.buttonsResponseMessage) {
    return message?.buttonsResponseMessage?.selectedDisplayText
  }
  if (message?.templateButtonReplyMessage) {
    return message?.templateButtonReplyMessage?.selectedDisplayText
  }

  return message?.conversation
}

export function messageLink({ key, message }: Pick<WAMessage, 'message' | 'key'>): MessageLink | undefined {
  const mess = normalizeMessageContent(message)?.extendedTextMessage
  if (mess?.matchedText) {
    let imgUrl: string
    if (mess.thumbnailDirectPath) {
      imgUrl = attachmentUrl(undefined, key.remoteJid!, mapMessageID(key), 'thumb')
    } else if (mess.jpegThumbnail?.length) {
      const jpgThumb = Buffer.from(mess.jpegThumbnail)
      imgUrl = getDataURIFromBuffer(jpgThumb, 'image/jpeg')
    } else {
      imgUrl = ''
    }

    return {
      url: mess.matchedText,
      img: imgUrl,
      imgSize: {
        width: mess.thumbnailWidth || 90,
        height: mess.thumbnailHeight || 90,
      },
      title: mess.title!,
      summary: mess.description!,
    }
  }
  const loc = message?.locationMessage || message?.liveLocationMessage
  if (loc) {
    return {
      url: `https://www.google.com/maps?q=${loc.degreesLatitude},${loc.degreesLongitude}`,
      title: 'Google Maps',
      summary: `${loc.degreesLatitude}, ${loc.degreesLongitude}`,
    }
  }
}

export function messageStubText(message: WAMessage) {
  const mapped = PRE_DEFINED_MESSAGES[message.messageStubType!]
  let txt = typeof mapped === 'function' ? mapped(message) : mapped
  if (txt) {
    message.messageStubParameters!.forEach((p, i) => {
      txt = txt.replace(`{{${i}}}`, p)
    })
  }
  return txt
}
