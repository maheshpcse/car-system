import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Icon, type IconName } from '@/shared/icons/Icon'
import { cx } from '@/core/utils/cx'
import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'text' | 'danger' | 'cta'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  iconLeft?: IconName
  iconRight?: IconName
  fullWidth?: boolean
  children?: ReactNode
  className?: string
}

export type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, iconLeft, iconRight, fullWidth, children, className, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, loading && styles.loading, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.content}>
        {iconLeft && <Icon name={iconLeft} size={size === 'sm' ? 15 : 17} />}
        {children}
        {iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 17} className={styles.iconRight} />}
      </span>
    </button>
  )
})

export type ButtonLinkProps = BaseProps & LinkProps

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth,
  children,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className)} {...rest}>
      <span className={styles.content}>
        {iconLeft && <Icon name={iconLeft} size={size === 'sm' ? 15 : 17} />}
        {children}
        {iconRight && <Icon name={iconRight} size={size === 'sm' ? 15 : 17} className={styles.iconRight} />}
      </span>
    </Link>
  )
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  label: string
  size?: ButtonSize
  variant?: 'ghost' | 'secondary' | 'primary' | 'circular'
  active?: boolean
  filled?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 'md', variant = 'ghost', active, filled, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cx(styles.iconButton, styles[`icon-${size}`], styles[`iconv-${variant}`], active && styles.active, className)}
      aria-pressed={active}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} filled={filled} />
    </button>
  )
})
