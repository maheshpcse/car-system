import type { ReactNode } from 'react'
import { PageTransition } from '@/animations/PageTransition'
import { cx } from '@/core/utils/cx'
import styles from './AuthCard.module.scss'

interface AuthCardProps {
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function AuthCard({ eyebrow, title, description, children, footer, wide }: AuthCardProps) {
  return (
    <PageTransition className={cx(styles.card, wide && styles.wide)}>
      <header className={styles.header}>
        <span className="t-eyebrow">{eyebrow}</span>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </header>
      <div className={styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </PageTransition>
  )
}

export function SocialPlaceholders() {
  return (
    <div className={styles.social} aria-label="Single sign-on (demo placeholders)">
      {['Google', 'Apple', 'Microsoft'].map((provider) => (
        <button key={provider} type="button" className={styles.socialButton} disabled title="Demo only">
          <span className={styles.socialDot} aria-hidden="true" />
          {provider}
        </button>
      ))}
    </div>
  )
}

export function OrDivider({ children = 'or continue with email' }: { children?: ReactNode }) {
  return (
    <div className={styles.divider} role="separator">
      <span>{children}</span>
    </div>
  )
}
