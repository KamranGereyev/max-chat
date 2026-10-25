import type { Credentials, Notification } from '../types'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function buildUrl({ apiUrl, idInstance, apiTokenInstance }: Credentials, method: string, suffix = '') {
  const host = apiUrl.replace(/\/+$/, '')
  return `${host}/waInstance${idInstance}/${method}/${apiTokenInstance}${suffix}`
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  const raw = await res.text()

  if (!res.ok) {
    let message = raw || res.statusText
    try {
      const parsed = JSON.parse(raw)
      message = parsed.message || parsed.reason || message
    } catch {
      // ответ не JSON — оставляем как есть
    }
    throw new ApiError(message, res.status)
  }

  return (raw ? JSON.parse(raw) : null) as T
}

export function getStateInstance(creds: Credentials) {
  return request<{ stateInstance: string }>(buildUrl(creds, 'getStateInstance'))
}

export async function checkAccount(creds: Credentials, phone: string) {
  const res = await request<{ exist?: boolean; chatId?: string; reason?: string }>(
    buildUrl(creds, 'checkAccount'),
    { method: 'POST', body: JSON.stringify({ phoneNumber: Number(phone) }) },
  )
  if (res.reason) throw new ApiError(res.reason, 400)
  return res
}

export function sendMessage(creds: Credentials, chatId: string, message: string) {
  return request<{ idMessage: string }>(buildUrl(creds, 'sendMessage'), {
    method: 'POST',
    body: JSON.stringify({ chatId, message }),
  })
}

export function receiveNotification(creds: Credentials, signal?: AbortSignal) {
  return request<Notification | null>(buildUrl(creds, 'receiveNotification', '?receiveTimeout=5'), {
    signal,
  })
}

export function deleteNotification(creds: Credentials, receiptId: number) {
  return request<{ result: boolean }>(buildUrl(creds, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
  })
}
