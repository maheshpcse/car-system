import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '@/core/utils/cx'
import { IconButton } from './Button'
import styles from './Sheet.module.scss'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  /** side: desktop drawer; bottom: mobile bottom sheet; center: dialog */
  placement?: 'side' | 'bottom' | 'center'
  width?: number
}

/**
 * Accessible modal surface used for filter drawers, dialogs and bottom sheets.
 * Handles focus trap basics, Escape, backdrop click and body scroll locking.
 */
export function Sheet({ open, onClose, title, children, footer, placement = 'side', width = 400 }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const body = document.body
    const prevOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('button, input, [tabindex]')?.focus()
    }, 30)

    return () => {
      document.removeEventListener('keydown', onKey)
      body.style.overflow = prevOverflow
      window.clearTimeout(t)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  const variants = {
    side: { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 40, opacity: 0 } },
    bottom: { initial: { y: 60, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 60, opacity: 0 } },
    center: { initial: { scale: 0.96, opacity: 0, y: 8 }, animate: { scale: 1, opacity: 1, y: 0 }, exit: { scale: 0.98, opacity: 0, y: 4 } },
  }[placement]

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cx(styles.root, styles[placement])}>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={styles.panel}
            style={placement === 'side' ? { width } : placement === 'center' ? { maxWidth: width } : undefined}
            initial={reduced ? { opacity: 0 } : variants.initial}
            animate={reduced ? { opacity: 1 } : variants.animate}
            exit={reduced ? { opacity: 0 } : variants.exit}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <IconButton icon="x" label="Close" onClick={onClose} />
            </header>
            <div className={styles.body}>{children}</div>
            {footer && <footer className={styles.footer}>{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
