import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/AuthProvider'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { cx } from '@/core/utils/cx'
import { AuthError } from '@/services/authService'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { Button } from '@/shared/ui/Button'
import { Checkbox, PasswordInput, Select, TextInput } from '@/shared/ui/Field'
import { AuthCard, OrDivider, SocialPlaceholders } from './AuthCard'
import { useAvatarFieldHandlers, useAvatarMood } from './avatarMood'
import { passwordStrength, validateEmail, validateName, validatePassword } from './validation'
import styles from './AuthForms.module.scss'

const COUNTRIES = ['Denmark', 'Germany', 'India', 'Netherlands', 'Norway', 'Sweden', 'United Kingdom', 'United States'].map((c) => ({ value: c, label: c }))

export default function SignupPage() {
  useDocumentTitle('Create account')
  const { signup } = useAuth()
  const { notify } = useToast()
  const { setMood } = useAvatarMood()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '', country: 'Denmark', terms: false })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [formError, setFormError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  const attentive = useAvatarFieldHandlers('attentive')
  const shy = useAvatarFieldHandlers('shy')

  const errors = {
    name: validateName(form.name),
    email: validateEmail(form.email),
    password: validatePassword(form.password, 8),
    confirm: form.confirm !== form.password ? 'Passwords do not match.' : undefined,
    terms: form.terms ? undefined : 'Please accept the terms to continue.',
  }
  const strength = passwordStrength(form.password)
  const valid = Object.values(errors).every((e) => !e)
  const show = (key: keyof typeof errors) => (touched[key] ? errors[key] : undefined)
  const set = (key: keyof typeof form) => (value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))
  const blur = (key: string, handlers: { onBlur: () => void }) => () => {
    setTouched((t) => ({ ...t, [key]: true }))
    handlers.onBlur()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirm: true, terms: true })
    if (!valid) return
    setLoading(true)
    setFormError(undefined)
    setMood('thinking')
    try {
      const user = await signup({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined, country: form.country })
      setMood('happy')
      notify(`Welcome, ${user.name.split(' ')[0]}. Your studio is ready.`, 'success')
      window.setTimeout(() => navigate('/', { replace: true }), 550)
    } catch (err) {
      setMood('sad')
      setFormError(err instanceof AuthError || err instanceof Error ? err.message : 'Could not create your account.')
      window.setTimeout(() => setMood('idle'), 1400)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      eyebrow="Join the studio"
      title="Create your account"
      description="Save builds, keep favourites in sync and compare vehicles across sessions."
      wide
      footer={
        <>
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </>
      }
    >
      <SocialPlaceholders />
      <OrDivider>or sign up with email</OrDivider>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <TextInput
          label="Full name"
          name="name"
          autoComplete="name"
          iconLeft="user"
          placeholder="Maya Lindqvist"
          value={form.name}
          error={show('name')}
          onChange={(e) => set('name')(e.target.value)}
          onFocus={attentive.onFocus}
          onBlur={blur('name', attentive)}
          required
        />
        <TextInput
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          iconLeft="mail"
          placeholder="you@example.com"
          value={form.email}
          error={show('email')}
          onChange={(e) => set('email')(e.target.value)}
          onFocus={attentive.onFocus}
          onBlur={blur('email', attentive)}
          required
        />
        <div className={styles.two}>
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            error={show('password')}
            onChange={(e) => set('password')(e.target.value)}
            onFocus={shy.onFocus}
            onBlur={blur('password', shy)}
            required
          />
          <PasswordInput
            label="Confirm password"
            name="confirm"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={form.confirm}
            error={show('confirm')}
            success={form.confirm && !errors.confirm ? 'Passwords match' : undefined}
            onChange={(e) => set('confirm')(e.target.value)}
            onFocus={shy.onFocus}
            onBlur={blur('confirm', shy)}
            required
          />
        </div>
        {form.password && (
          <div className={cx(styles.strength, styles[`s${strength.score}`])} aria-live="polite">
            <div className={styles.strengthBars}>
              <span />
              <span />
              <span />
              <span />
            </div>
            <span className={styles.strengthLabel}>Password strength: {strength.label}</span>
          </div>
        )}
        <div className={styles.two}>
          <TextInput
            label="Phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            iconLeft="phone"
            placeholder="+45 12 34 56 78"
            optional
            value={form.phone}
            onChange={(e) => set('phone')(e.target.value)}
            onFocus={attentive.onFocus}
            onBlur={attentive.onBlur}
          />
          <Select label="Country" iconLeft="globe" options={COUNTRIES} value={form.country} onChange={set('country')} />
        </div>
        <Checkbox
          label={
            <>
              I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
            </>
          }
          checked={form.terms}
          onChange={(e) => set('terms')(e.target.checked)}
          onBlur={() => setTouched((t) => ({ ...t, terms: true }))}
        />
        {touched.terms && errors.terms && (
          <p className={styles.formError} role="alert">
            <Icon name="alert" size={15} /> {errors.terms}
          </p>
        )}
        {formError && (
          <p className={styles.formError} role="alert">
            <Icon name="alert" size={15} /> {formError}
          </p>
        )}
        <Button type="submit" size="lg" fullWidth loading={loading} disabled={!valid || loading} iconRight="arrowRight">
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
