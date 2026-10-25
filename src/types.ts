export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export interface Message {
  id: string
  text: string
  timestamp: number
  outgoing: boolean
}

export interface Chat {
  chatId: string
  phone: string
  name: string
  messages: Message[]
  unread: number
}

export interface Notification {
  receiptId: number
  body: NotificationBody
}

export interface NotificationBody {
  typeWebhook: string
  timestamp: number
  idMessage?: string
  senderData?: {
    chatId: string
    chatName?: string
    senderName?: string
    senderContactName?: string
    senderPhoneNumber?: number
  }
  messageData?: {
    typeMessage: string
    textMessageData?: { textMessage: string }
    extendedTextMessageData?: { text: string }
  }
}
