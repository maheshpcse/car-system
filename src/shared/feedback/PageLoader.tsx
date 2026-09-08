import styles from './PageLoader.module.scss'

interface PageLoaderProps {
  label?: string
  fullscreen?: boolean
}

/** Route-level loading state: a thin progress line plus a quiet label. */
export function PageLoader({ label = 'Loading', fullscreen }: PageLoaderProps) {
  return (
    <div className={fullscreen ? styles.fullscreen : styles.inline} role="status" aria-live="polite">
      <div className={styles.bar}>
        <span />
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
