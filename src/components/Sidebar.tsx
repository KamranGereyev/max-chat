import { useState, type FormEvent } from 'react'
import type { Chat } from '../types'
import { formatPhone, formatTime, isValidPhone, normalizePhone } from '../utils/format'
import { Avatar } from './Avatar'

interface Props {
  chats: Chat[]
  activeChatId: string | null
  onSelect: (chatId: string) => void
  onCreate: (phone: string) => Promise<void>
  onLogout: () => void
}

export function Sidebar({ chats, activeChatId, onSelect, onCreate, onLogout }: Props) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const normalized = normalizePhone(phone)

    if (!isValidPhone(normalized)) {
      setError('Номер в формате 79991234567')
      return
    }

    setError('')
    setCreating(true)
    try {
      await onCreate(normalized)
      setPhone('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать чат')
    } finally {
      setCreating(false)
    }
  }

  const sorted = [...chats].sort((a, b) => lastTime(b) - lastTime(a))

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h2>Чаты</h2>
        <button className="btn btn--ghost" onClick={onLogout} title="Выйти">
          Выйти
        </button>
      </header>

      <form className="new-chat" onSubmit={handleSubmit}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер телефона получателя"
          inputMode="tel"
        />
        <button className="btn btn--primary" disabled={creating || !phone}>
          {creating ? '…' : '+'}
        </button>
      </form>
      {error && <div className="new-chat__error">{error}</div>}

      <ul className="chat-list">
        {sorted.length === 0 && <li className="chat-list__empty">Пока нет чатов</li>}

        {sorted.map((chat) => {
          const last = chat.messages.at(-1)
          return (
            <li
              key={chat.chatId}
              className={`chat-item ${chat.chatId === activeChatId ? 'chat-item--active' : ''}`}
              onClick={() => onSelect(chat.chatId)}
            >
              <Avatar name={chat.name} seed={chat.chatId} />
              <div className="chat-item__body">
                <div className="chat-item__row">
                  <span className="chat-item__name">{chat.name || formatPhone(chat.phone)}</span>
                  {last && <span className="chat-item__time">{formatTime(last.timestamp)}</span>}
                </div>
                <div className="chat-item__row">
                  <span className="chat-item__preview">
                    {last ? `${last.outgoing ? 'Вы: ' : ''}${last.text}` : 'Нет сообщений'}
                  </span>
                  {chat.unread > 0 && <span className="badge">{chat.unread}</span>}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

function lastTime(chat: Chat) {
  return chat.messages.at(-1)?.timestamp ?? 0
}
