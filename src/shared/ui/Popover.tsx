import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '@/core/utils/cx'
import styles from './Popover.module.scss'

interface PopoverProps {
  open: boolean
  onClose: () => void
  anchor: ReactNode
  children: ReactNode
  align?: 'start' | 'end'
  width?: number | string
  className?: string
}

/**
 * Lightweight anchored popover. Closes on outside click and Escape.
 */
export function Popover({ open, onClose, anchor, children, align = 'end', width = 240, className }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div ref={ref} className={cx(styles.root, className)}>
      {anchor}
      <AnimatePresence>
        {open && (
          <motion.div
            className={cx(styles.panel, styles[align])}
            style={{ width }}
            initial={{ opacity: 0, y: reduced ? 0 : -6, scale: reduced ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduced ? 0 : -4, scale: reduced ? 1 : 0.98 }}
            transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MenuItemProps {
  children: ReactNode
  onClick?: () => void
  icon?: ReactNode
  danger?: boolean
  active?: boolean
  trailing?: ReactNode
}

export function MenuItem({ children, onClick, icon, danger, active, trailing }: MenuItemProps) {
  return (
    <button type="button" role="menuitem" className={cx(styles.item, danger && styles.danger, active && styles.active)} onClick={onClick}>
      {icon && <span className={styles.itemIcon}>{icon}</span>}
      <span className={styles.itemLabel}>{children}</span>
      {trailing && <span className={styles.itemTrailing}>{trailing}</span>}
    </button>
  )
}

export function MenuDivider() {
  return <div className={styles.divider} role="separator" />
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <div className={styles.label}>{children}</div>
}
