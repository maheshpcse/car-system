import type { ReactNode } from 'react'
import { Icon, type IconName } from '@/shared/icons/Icon'
import { cx } from '@/core/utils/cx'
import styles from './EmptyState.module.scss'

interface EmptyStateProps {
  icon: IconName
  title: string
  description: string
  action?: ReactNode
  compact?: boolean
  className?: string
}

export function EmptyState({ icon, title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div className={cx(styles.root, compact && styles.compact, className)} role="status">
      <div className={styles.visual} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.ringInner} />
        <Icon name={icon} size={compact ? 24 : 30} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
