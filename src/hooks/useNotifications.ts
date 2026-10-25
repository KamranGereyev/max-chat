import { useEffect, useRef } from 'react'
import { deleteNotification, receiveNotification } from '../api/greenApi'
import type { Credentials, NotificationBody } from '../types'

const RETRY_DELAY = 3000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Long polling очереди уведомлений GREEN-API:
 * receiveNotification -> обработка -> deleteNotification -> следующий запрос.
 */
export function useNotifications(
  creds: Credentials | null,
  onNotification: (body: NotificationBody) => void,
) {
  // держим актуальный колбэк, чтобы не перезапускать цикл при каждом рендере
  const handlerRef = useRef(onNotification)
  useEffect(() => {
    handlerRef.current = onNotification
  })

  useEffect(() => {
    if (!creds) return

    const controller = new AbortController()
    let stopped = false

    async function loop() {
      while (!stopped) {
        try {
          const notification = await receiveNotification(creds!, controller.signal)
          if (!notification) continue

          try {
            handlerRef.current(notification.body)
          } finally {
            await deleteNotification(creds!, notification.receiptId)
          }
        } catch (err) {
          if (stopped) return
          console.warn('Ошибка получения уведомлений', err)
          await sleep(RETRY_DELAY)
        }
      }
    }

    loop()

    return () => {
      stopped = true
      controller.abort()
    }
  }, [creds])
}
