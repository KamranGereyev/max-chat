import { useState, type FormEvent } from 'react'
import { getStateInstance } from '../api/greenApi'
import type { Credentials } from '../types'

const DEFAULT_API_URL = 'https://api.green-api.com'

interface Props {
  onLogin: (creds: Credentials) => void
}

export function LoginForm({ onLogin }: Props) {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const creds: Credentials = {
      apiUrl: apiUrl.trim() || DEFAULT_API_URL,
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }

    setLoading(true)
    try {
      const { stateInstance } = await getStateInstance(creds)
      if (stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован (статус: ${stateInstance}). Отсканируйте QR-код в личном кабинете.`)
        return
      }
      onLogin(creds)
    } catch {
      setError('Не удалось подключиться. Проверьте apiUrl, idInstance и apiTokenInstance.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__logo">M</div>
        <h1 className="login__title">Вход</h1>
        <p className="login__hint">
          Данные инстанса можно найти в{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            личном кабинете GREEN-API
          </a>
        </p>

        <label className="field">
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="3100000000"
            inputMode="numeric"
            required
          />
        </label>

        <label className="field">
          <span>apiTokenInstance</span>
          <input
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            type="password"
            autoComplete="off"
            required
          />
        </label>

        <label className="field">
          <span>apiUrl</span>
          <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} />
        </label>

        {error && <div className="login__error">{error}</div>}

        <button className="btn btn--primary" disabled={loading}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
