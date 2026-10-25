export function normalizePhone(value: string) {
  return value.replace(/\D/g, '')
}

export function isValidPhone(phone: string) {
  // MAX через GREEN-API работает только с номерами РФ (7XXXXXXXXXX) и РБ (375XXXXXXXXX)
  return /^7\d{10}$/.test(phone) || /^375\d{9}$/.test(phone)
}

export function formatPhone(phone: string) {
  if (/^7\d{10}$/.test(phone)) {
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`
  }
  return phone ? `+${phone}` : ''
}

export function formatTime(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function initials(name: string) {
  const letters = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
  return (letters || '#').toUpperCase()
}

const palette = ['#5b6cff', '#ff7a45', '#13c2c2', '#9254de', '#52c41a', '#eb2f96', '#fa8c16']

export function avatarColor(seed: string) {
  let hash = 0
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) | 0
  return palette[Math.abs(hash) % palette.length]
}
