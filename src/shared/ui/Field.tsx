import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Icon, type IconName } from '@/shared/icons/Icon'
import { cx } from '@/core/utils/cx'
import styles from './Field.module.scss'

/* Shared wrapper ------------------------------------------------------------ */

interface FieldShellProps {
  id: string
  label?: string
  hint?: string
  error?: string
  success?: string
  optional?: boolean
  children: ReactNode
  className?: string
}

export function FieldShell({ id, label, hint, error, success, optional, children, className }: FieldShellProps) {
  const message = error ?? success ?? hint
  return (
    <div className={cx(styles.field, error && styles.hasError, success && styles.hasSuccess, className)}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {optional && <span className={styles.optional}>Optional</span>}
        </label>
      )}
      {children}
      {message && (
        <p id={`${id}-message`} className={styles.message} role={error ? 'alert' : undefined}>
          {error && <Icon name="alert" size={13} />}
          {success && <Icon name="check" size={13} />}
          {message}
        </p>
      )}
    </div>
  )
}

/* Text input ---------------------------------------------------------------- */

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  success?: string
  optional?: boolean
  iconLeft?: IconName
  trailing?: ReactNode
  wrapperClassName?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, hint, error, success, optional, iconLeft, trailing, id: idProp, className, wrapperClassName, ...rest },
  ref,
) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} success={success} optional={optional} className={wrapperClassName}>
      <div className={cx(styles.control, iconLeft && styles.withIcon, Boolean(trailing) && styles.withTrailing)}>
        {iconLeft && <Icon name={iconLeft} size={17} className={styles.icon} />}
        <input
          ref={ref}
          id={id}
          className={cx(styles.input, className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint || success ? `${id}-message` : undefined}
          {...rest}
        />
        {trailing && <div className={styles.trailing}>{trailing}</div>}
      </div>
    </FieldShell>
  )
})

/* Password input ------------------------------------------------------------ */

export const PasswordInput = forwardRef<HTMLInputElement, Omit<TextInputProps, 'type' | 'trailing'>>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false)
    return (
      <TextInput
        ref={ref}
        type={visible ? 'text' : 'password'}
        iconLeft={props.iconLeft ?? 'lock'}
        autoComplete={props.autoComplete ?? 'current-password'}
        trailing={
          <button
            type="button"
            className={styles.trailingButton}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            <Icon name={visible ? 'eyeOff' : 'eye'} size={17} />
          </button>
        }
        {...props}
      />
    )
  },
)

/* Textarea ------------------------------------------------------------------ */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  optional?: boolean
}

export function Textarea({ label, hint, error, optional, id: idProp, className, ...rest }: TextareaProps) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional}>
      <div className={styles.control}>
        <textarea id={id} className={cx(styles.input, styles.textarea, className)} aria-invalid={error ? true : undefined} {...rest} />
      </div>
    </FieldShell>
  )
}

/* Select -------------------------------------------------------------------- */

export interface SelectOption<T extends string = string> {
  value: T
  label: string
  disabled?: boolean
}

export interface SelectProps<T extends string = string> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  label?: string
  hint?: string
  error?: string
  options: SelectOption<T>[]
  value: T
  onChange: (value: T) => void
  iconLeft?: IconName
  compact?: boolean
  wrapperClassName?: string
}

export function Select<T extends string>({
  label,
  hint,
  error,
  options,
  value,
  onChange,
  iconLeft,
  compact,
  id: idProp,
  className,
  wrapperClassName,
  ...rest
}: SelectProps<T>) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} className={wrapperClassName}>
      <div className={cx(styles.control, styles.selectControl, iconLeft && styles.withIcon, compact && styles.compact)}>
        {iconLeft && <Icon name={iconLeft} size={17} className={styles.icon} />}
        <select
          id={id}
          className={cx(styles.input, styles.select, className)}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size={16} className={styles.chevron} />
      </div>
    </FieldShell>
  )
}

/* Checkbox / Radio / Toggle ------------------------------------------------- */

interface CheckProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode
  description?: string
}

export function Checkbox({ label, description, id: idProp, className, ...rest }: CheckProps) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <label htmlFor={id} className={cx(styles.check, className)}>
      <input id={id} type="checkbox" className={styles.checkInput} {...rest} />
      <span className={styles.checkBox} aria-hidden="true">
        <Icon name="check" size={12} strokeWidth={2.4} />
      </span>
      <span className={styles.checkText}>
        <span>{label}</span>
        {description && <span className={styles.checkDescription}>{description}</span>}
      </span>
    </label>
  )
}

export function Radio({ label, description, id: idProp, className, ...rest }: CheckProps) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <label htmlFor={id} className={cx(styles.check, className)}>
      <input id={id} type="radio" className={styles.checkInput} {...rest} />
      <span className={cx(styles.checkBox, styles.radio)} aria-hidden="true" />
      <span className={styles.checkText}>
        <span>{label}</span>
        {description && <span className={styles.checkDescription}>{description}</span>}
      </span>
    </label>
  )
}

export function Toggle({ label, description, id: idProp, className, ...rest }: CheckProps) {
  const generated = useId()
  const id = idProp ?? generated
  return (
    <label htmlFor={id} className={cx(styles.check, styles.toggleRow, className)}>
      <span className={styles.checkText}>
        <span>{label}</span>
        {description && <span className={styles.checkDescription}>{description}</span>}
      </span>
      <input id={id} type="checkbox" role="switch" className={styles.checkInput} {...rest} />
      <span className={styles.toggle} aria-hidden="true">
        <span className={styles.toggleKnob} />
      </span>
    </label>
  )
}

/* Slider -------------------------------------------------------------------- */

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  label: string
  value: number
  onChange: (value: number) => void
  format?: (value: number) => string
}

export function Slider({ label, value, onChange, format, min = 0, max = 100, id: idProp, className, ...rest }: SliderProps) {
  const generated = useId()
  const id = idProp ?? generated
  const pct = ((value - Number(min)) / (Number(max) - Number(min))) * 100
  return (
    <div className={cx(styles.field, className)}>
      <div className={styles.sliderHeader}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <span className={styles.sliderValue}>{format ? format(value) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
        {...rest}
      />
    </div>
  )
}

/* OTP ----------------------------------------------------------------------- */

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  disabled?: boolean
}

export function OTPInput({ length = 6, value, onChange, label = 'Verification code', error, disabled }: OTPInputProps) {
  const id = useId()
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focusIndex = (i: number) => {
    const el = document.getElementById(`${id}-${i}`) as HTMLInputElement | null
    el?.focus()
    el?.select()
  }

  return (
    <FieldShell id={`${id}-0`} label={label} error={error}>
      <div className={styles.otp} role="group" aria-label={label}>
        {digits.map((digit, i) => (
          <input
            key={i}
            id={`${id}-${i}`}
            className={cx(styles.input, styles.otpCell, digit && styles.filled)}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            value={digit}
            aria-label={`Digit ${i + 1}`}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              const char = e.target.value.replace(/\D/g, '').slice(-1)
              const next = digits.slice()
              next[i] = char
              onChange(next.join(''))
              if (char && i < length - 1) focusIndex(i + 1)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digit && i > 0) focusIndex(i - 1)
              if (e.key === 'ArrowLeft' && i > 0) focusIndex(i - 1)
              if (e.key === 'ArrowRight' && i < length - 1) focusIndex(i + 1)
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
              if (text) {
                e.preventDefault()
                onChange(text)
                focusIndex(Math.min(text.length, length - 1))
              }
            }}
          />
        ))}
      </div>
    </FieldShell>
  )
}
