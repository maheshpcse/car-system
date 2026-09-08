import { motion, useReducedMotion } from 'framer-motion'
import { useId } from 'react'
import { Icon, type IconName } from '@/shared/icons/Icon'
import { cx } from '@/core/utils/cx'
import styles from './Segmented.module.scss'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  icon?: IconName
  iconOnly?: boolean
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  size?: 'sm' | 'md'
  className?: string
}

export function Segmented<T extends string>({ options, value, onChange, label, size = 'md', className }: SegmentedProps<T>) {
  const id = useId()
  const reduced = useReducedMotion()
  return (
    <div className={cx(styles.root, styles[size], className)} role="radiogroup" aria-label={label}>
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.iconOnly ? opt.label : undefined}
            title={opt.iconOnly ? opt.label : undefined}
            className={cx(styles.option, selected && styles.selected, opt.iconOnly && styles.iconOnly)}
            onClick={() => onChange(opt.value)}
          >
            {selected && (
              <motion.span
                layoutId={`${id}-indicator`}
                className={styles.indicator}
                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className={styles.content}>
              {opt.icon && <Icon name={opt.icon} size={size === 'sm' ? 15 : 17} />}
              {!opt.iconOnly && <span>{opt.label}</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}
