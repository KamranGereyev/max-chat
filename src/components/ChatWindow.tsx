import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { Chat } from '../types'
import { formatPhone, formatTime } from '../utils/format'
import { Avatar } from './Avatar'

const MAX_LENGTH = 4000

interface Props {
  chat: Chat | null
  onSend: (text: string) => Promise<void>
  onBack: () => void
}

export function ChatWindow({ chat, onSend, onBack }: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages.length, chat?.chatId])

  useEffect(() => {
    setText('')
    setError('')
  }, [chat?.chatId])

  if (!chat) {
    return (
      <section className="chat chat--empty">
        <p>Выберите чат или создайте новый по номеру телефона</p>
      </section>
    )
  }

  async function submit() {
    const value = text.trim()
    if (!value || sending) return

    setSending(true)
    setError('')
    try {
      await onSend(value)
      setText('')
    } catch {
      setError('Сообщение не отправлено, попробуйте ещё раз')
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    submit()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const title = chat.name || formatPhone(chat.phone)

  return (
    <section className="chat">
      <header className="chat__header">
        <button className="chat__back" onClick={onBack} aria-label="Назад">
          ‹
        </button>
        <Avatar name={title} seed={chat.chatId} size={38} />
        <div>
          <div className="chat__title">{title}</div>
          {chat.phone && chat.name && <div className="chat__subtitle">{formatPhone(chat.phone)}</div>}
        </div>
      </header>

      <div className="chat__messages">
        {chat.messages.length === 0 && <div className="chat__placeholder">Напишите первое сообщение</div>}

        {chat.messages.map((msg) => (
          <div key={msg.id} className={`bubble ${msg.outgoing ? 'bubble--out' : 'bubble--in'}`}>
            <span className="bubble__text">{msg.text}</span>
            <span className="bubble__time">{formatTime(msg.timestamp)}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <div className="chat__error">{error}</div>}

      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение"
          maxLength={MAX_LENGTH}
          rows={1}
        />
        <button className="composer__send" disabled={!text.trim() || sending} aria-label="Отправить">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M3.4 20.4 21 12 3.4 3.6 3.4 10.1 15 12 3.4 13.9z" />
          </svg>
        </button>
      </form>
    </section>
  )
}
