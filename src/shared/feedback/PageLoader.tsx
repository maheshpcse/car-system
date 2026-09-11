import { cx } from '@/core/utils/cx'
import styles from './PageLoader.module.scss'

interface PageLoaderProps {
  label?: string
  fullscreen?: boolean
  className?: string
}

/** Shared with the boot loader in index.html so first paint and route waits match. */
export function PageLoader({ label = 'Preparing the studio', fullscreen, className }: PageLoaderProps) {
  return (
    <div className={cx(styles.root, fullscreen ? styles.fullscreen : styles.inline, className)} role="status" aria-live="polite">
      <div className={styles.emblem} aria-hidden="true">
        <span className={cx(styles.ring, styles.ringOuter)} />
        <span className={styles.ring} />
        <span className={styles.mark}>
          <svg viewBox="0 0 32 32">
            <path
              d="M7 19c0-1.6 1-3 3-3.8l3-3.4c.8-.9 1.8-1.4 3-1.4h5c1.5 0 2.8.8 3.5 2l2 3c1.5.5 2.5 1.7 2.5 3.4v1.5c0 .8-.6 1.3-1.4 1.3h-1.4a3 3 0 0 1-6 0h-6a3 3 0 0 1-6 0H7v-2.6z"
              fill="var(--color-background)"
            />
          </svg>
        </span>
      </div>
      {fullscreen && (
        <div className={styles.word} aria-hidden="true">
          <span>Aurora</span>
          <span>Motors</span>
        </div>
      )}
      <div className={styles.track}>
        <i />
      </div>
      <p className={styles.caption}>{label}</p>
    </div>
  )
}
