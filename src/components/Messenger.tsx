import { useCallback, useState } from 'react'
import { checkAccount, sendMessage } from '../api/greenApi'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useNotifications } from '../hooks/useNotifications'
import type { Chat, Credentials, Message, NotificationBody } from '../types'
import { ChatWindow } from './ChatWindow'
import { Sidebar } from './Sidebar'

function extractText(body: NotificationBody) {
  const data = body.messageData
  if (!data) return null
  if (data.typeMessage === 'textMessage') return data.textMessageData?.textMessage ?? null
  if (data.typeMessage === 'extendedTextMessage') return data.extendedTextMessageData?.text ?? null
  return null
}

function addMessage(chats: Chat[], chatId: string, message: Message, patch: Partial<Chat> = {}) {
  const existing = chats.find((c) => c.chatId === chatId)

  if (!existing) {
    const created: Chat = { chatId, phone: '', name: '', messages: [message], unread: 0, ...patch }
    return [...chats, created]
  }

  if (existing.messages.some((m) => m.id === message.id)) return chats

  return chats.map((c) =>
    c.chatId === chatId ? { ...c, ...patch, messages: [...c.messages, message] } : c,
  )
}

interface Props {
  creds: Credentials
  onLogout: () => void
}

export function Messenger({ creds, onLogout }: Props) {
  const [chats, setChats] = useLocalStorage<Chat[]>(`max-chat:chats:${creds.idInstance}`, [])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  const handleNotification = useCallback(
    (body: NotificationBody) => {
      const isIncoming = body.typeWebhook === 'incomingMessageReceived'
      const isFromPhone = body.typeWebhook === 'outgoingMessageReceived'
      if (!isIncoming && !isFromPhone) return

      const text = extractText(body)
      const sender = body.senderData
      if (text === null || !sender || !body.idMessage) return

      const message: Message = {
        id: body.idMessage,
        text,
        timestamp: body.timestamp,
        outgoing: isFromPhone,
      }

      setChats((prev) => {
        const current = prev.find((c) => c.chatId === sender.chatId)
        const patch: Partial<Chat> = {}

        if (!current?.name && sender.chatName) patch.name = sender.chatName
        if (!current?.phone && sender.senderPhoneNumber) patch.phone = String(sender.senderPhoneNumber)
        if (isIncoming && sender.chatId !== activeChatId) patch.unread = (current?.unread ?? 0) + 1

        return addMessage(prev, sender.chatId, message, patch)
      })
    },
    [activeChatId, setChats],
  )

  useNotifications(creds, handleNotification)

  async function handleCreateChat(phone: string) {
    const existing = chats.find((c) => c.phone === phone)
    if (existing) {
      selectChat(existing.chatId)
      return
    }

    const { exist, chatId } = await checkAccount(creds, phone)
    if (!exist || !chatId) throw new Error('У этого номера нет аккаунта MAX')

    setChats((prev) =>
      prev.some((c) => c.chatId === chatId)
        ? prev.map((c) => (c.chatId === chatId ? { ...c, phone } : c))
        : [...prev, { chatId, phone, name: '', messages: [], unread: 0 }],
    )
    setActiveChatId(chatId)
  }

  async function handleSend(text: string) {
    if (!activeChatId) return

    const { idMessage } = await sendMessage(creds, activeChatId, text)
    const message: Message = {
      id: idMessage,
      text,
      timestamp: Math.floor(Date.now() / 1000),
      outgoing: true,
    }
    setChats((prev) => addMessage(prev, activeChatId, message))
  }

  function selectChat(chatId: string) {
    setActiveChatId(chatId)
    setChats((prev) => prev.map((c) => (c.chatId === chatId ? { ...c, unread: 0 } : c)))
  }

  const activeChat = chats.find((c) => c.chatId === activeChatId) ?? null

  return (
    <div className={`layout ${activeChat ? 'layout--chat-open' : ''}`}>
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelect={selectChat}
        onCreate={handleCreateChat}
        onLogout={onLogout}
      />
      <ChatWindow chat={activeChat} onSend={handleSend} onBack={() => setActiveChatId(null)} />
    </div>
  )
}
