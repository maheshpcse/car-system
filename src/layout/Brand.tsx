import { Link } from 'react-router-dom'
import { env } from '@/core/config/environment'
import { cx } from '@/core/utils/cx'
import styles from './Brand.module.scss'

interface BrandProps {
  compact?: boolean
  className?: string
  to?: string
}

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <g fill="none" stroke="var(--color-background)" strokeWidth="1.6" strokeLinecap="square">
        <path d="M6 20h4l3-5h10l3 5h4" />
        <path d="M10 20v2h12v-2" />
        <circle cx="11" cy="23" r="2" />
        <circle cx="21" cy="23" r="2" />
        <path d="M16 6v8" />
        <path d="M12 10h8" />
      </g>
    </svg>
  )
}

export function Brand({ compact, className, to = '/' }: BrandProps) {
  return (
    <Link to={to} className={cx(styles.brand, compact && styles.compact, className)} aria-label={`${env.appName} home`}>
      <span className={styles.mark} aria-hidden="true">
        <BrandMark />
      </span>
      {!compact && (
        <span className={styles.text}>
          <span className={styles.name}>Rekha</span>
          <span className={styles.suffix}>Motors</span>
        </span>
      )}
    </Link>
  )
}
