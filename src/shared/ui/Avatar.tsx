import { cx } from '@/core/utils/cx'
import styles from './Avatar.module.scss'

interface AvatarProps {
  name: string
  seed?: number
  size?: number
  className?: string
}

const HUES = ['#1400C3', '#0984E3', '#00CEC9', '#FF4E02', '#BA0001', '#5E7C55']

/** Minimal initials avatar; the 3D avatar is used on auth/profile pages. */
export function Avatar({ name, seed = 0, size = 34, className }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')
  const bg = HUES[seed % HUES.length]
  return (
    <span
      className={cx(styles.avatar, className)}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials || '•'}
    </span>
  )
}
