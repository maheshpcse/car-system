import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '@/core/utils/cx'
import { Icon, type IconName } from '@/shared/icons/Icon'
import styles from './Card.module.scss'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  tone?: 'default' | 'muted' | 'inverse'
}

export function Card({ padding = 'md', interactive, tone = 'default', className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx(styles.card, styles[`pad-${padding}`], styles[`tone-${tone}`], interactive && styles.interactive, className)}
      {...rest}
    >
      {children}
    </div>
  )
}

interface SpecCardProps {
  icon: IconName
  label: string
  value: string
  detail?: string
  className?: string
}

export function SpecCard({ icon, label, value, detail, className }: SpecCardProps) {
  return (
    <div className={cx(styles.spec, className)}>
      <span className={styles.specIcon}>
        <Icon name={icon} size={18} />
      </span>
      <div className={styles.specBody}>
        <span className={styles.specLabel}>{label}</span>
        <span className={styles.specValue}>{value}</span>
        {detail && <span className={styles.specDetail}>{detail}</span>}
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: IconName
  title: string
  description: string
  children?: ReactNode
  className?: string
}

export function FeatureCard({ icon, title, description, children, className }: FeatureCardProps) {
  return (
    <div className={cx(styles.feature, className)}>
      <span className={styles.featureIcon}>
        <Icon name={icon} size={20} />
      </span>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
      {children}
    </div>
  )
}

interface StatProps {
  label: string
  value: string
  unit?: string
  className?: string
}

export function Stat({ label, value, unit, className }: StatProps) {
  return (
    <div className={cx(styles.stat, className)}>
      <span className={styles.statValue}>
        {value}
        {unit && <span className={styles.statUnit}>{unit}</span>}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
