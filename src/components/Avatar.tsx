import { avatarColor, initials } from '../utils/format'

export function Avatar({ name, seed, size = 44 }: { name: string; seed: string; size?: number }) {
  return (
    <div
      className="avatar"
      style={{ background: avatarColor(seed), width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  )
}
