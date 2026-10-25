import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? (JSON.parse(saved) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage может быть недоступен (приватный режим и т.п.)
    }
  }, [key, value])

  return [value, setValue] as const
}
