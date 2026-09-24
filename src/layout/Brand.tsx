import { Link } from 'react-router-dom'
import { env } from '@/core/config/environment'
import { cx } from '@/core/utils/cx'
import styles from './Brand.module.scss'

interface BrandProps {
  compact?: boolean
  className?: string
  to?: string
}

export function Brand({ compact, className, to = '/' }: BrandProps) {
  return (
    <Link to={to} className={cx(styles.brand, compact && styles.compact, className)} aria-label={`${env.appName} home`}>
      <span className={styles.mark} aria-hidden="true">
        <svg viewBox="0 0 32 32" width="32" height="32">
          <rect width="32" height="32" rx="9" fill="currentColor" />
          <path
            d="M7 19c0-1.6 1-3 3-3.8l3-3.4c.8-.9 1.8-1.4 3-1.4h5c1.5 0 2.8.8 3.5 2l2 3c1.5.5 2.5 1.7 2.5 3.4v1.5c0 .8-.6 1.3-1.4 1.3h-1.4a3 3 0 0 1-6 0h-6a3 3 0 0 1-6 0H7v-2.6z"
            fill="var(--color-background)"
          />
        </svg>
      </span>
      {!compact && (
        <span className={styles.text}>
          <span className={styles.name}>Aurora</span>
          <span className={styles.suffix}>Motors</span>
        </span>
      )}
    </Link>
  )
}
