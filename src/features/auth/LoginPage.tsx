import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/AuthProvider'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { AuthError } from '@/services/authService'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { Button, ButtonLink } from '@/shared/ui/Button'
import { Checkbox, PasswordInput, TextInput } from '@/shared/ui/Field'
import { Segmented } from '@/shared/ui/Segmented'
import { AuthCard, OrDivider, SocialPlaceholders } from './AuthCard'
import { useAvatarFieldHandlers, useAvatarMood } from './avatarMood'
import { validateEmail, validatePassword, validateUsername } from './validation'
import styles from './AuthForms.module.scss'

type LoginMethod = 'username' | 'email'

export default function LoginPage() {
  useDocumentTitle('Sign in')
  const { login } = useAuth()
  const { notify } = useToast()
  const { setMood } = useAvatarMood()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [method, setMethod] = useState<LoginMethod>('username')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string; form?: string }>({})
  const [touched, setTouched] = useState<{ username?: boolean; email?: boolean; password?: boolean }>({})
  const [loading, setLoading] = useState(false)
  const [skipLiveSubmitGate, setSkipLiveSubmitGate] = useState(false)

  const identifierHandlers = useAvatarFieldHandlers('attentive')
  const passwordHandlers = useAvatarFieldHandlers('shy')

  const usernameError = method === 'username' && touched.username ? validateUsername(username) : undefined
  const emailError = method === 'email' && touched.email ? validateEmail(email) : undefined
  const passwordError = touched.password ? validatePassword(password) : undefined
  const identifierInvalid = method === 'username' ? Boolean(validateUsername(username)) : Boolean(validateEmail(email))
  const passwordInvalid = Boolean(validatePassword(password))
  const canSubmit = !loading && (skipLiveSubmitGate || (!identifierInvalid && !passwordInvalid))

  const resetValidationForTabSwitch = () => {
    setErrors({})
    setTouched({})
    setSkipLiveSubmitGate(true)
    setMood('idle')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSkipLiveSubmitGate(false)
    setTouched({ username: method === 'username', email: method === 'email', password: true })
    if (identifierInvalid || passwordInvalid) return
    setLoading(true)
    setErrors({})
    setMood('thinking')
    try {
      const user = await login({
        ...(method === 'username' ? { username: username.trim() } : { email: email.trim() }),
        password,
        remember,
      })
      setMood('happy')
      notify(`Welcome back, ${user.name.split(' ')[0]}`, 'success')
      window.setTimeout(() => navigate(from, { replace: true }), 550)
    } catch (err) {
      setMood('sad')
      const field = err instanceof AuthError ? err.field ?? 'form' : 'form'
      setErrors({ [field]: err instanceof Error ? err.message : 'Sign in failed. Please try again.' })
      window.setTimeout(() => setMood('idle'), 1400)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in to your studio"
      description="Use your username or email. Pick up saved builds, favourites and comparisons across devices."
      footer={
        <>
          <span>New here?</span>
          <Link to="/signup">Create an account</Link>
          <span aria-hidden="true">·</span>
          <Link to="/demo-login">Try a demo persona</Link>
        </>
      }
    >
      <SocialPlaceholders />
      <OrDivider />

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <Segmented
          className={styles.loginMethod}
          label="Sign in with"
          value={method}
          onChange={(next) => {
            if (next === method) return
            setMethod(next)
            resetValidationForTabSwitch()
          }}
          options={[
            { value: 'username', label: 'Username', icon: 'user' },
            { value: 'email', label: 'Email', icon: 'mail' },
          ]}
        />

        {method === 'username' ? (
          <TextInput
            label="Username"
            name="username"
            autoComplete="username"
            iconLeft="user"
            placeholder="maya"
            value={username}
            error={errors.username ?? usernameError}
            onChange={(e) => {
              setSkipLiveSubmitGate(false)
              setUsername(e.target.value)
              setErrors((current) => ({ ...current, username: undefined, form: undefined }))
            }}
            onFocus={identifierHandlers.onFocus}
            onBlur={() => {
              setTouched((t) => ({ ...t, username: true }))
              identifierHandlers.onBlur()
            }}
            required
          />
        ) : (
          <TextInput
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            iconLeft="mail"
            placeholder="you@example.com"
            value={email}
            error={errors.email ?? emailError}
            onChange={(e) => {
              setSkipLiveSubmitGate(false)
              setEmail(e.target.value)
              setErrors((current) => ({ ...current, email: undefined, form: undefined }))
            }}
            onFocus={identifierHandlers.onFocus}
            onBlur={() => {
              setTouched((t) => ({ ...t, email: true }))
              identifierHandlers.onBlur()
            }}
            required
          />
        )}
        <PasswordInput
          label="Password"
          name="password"
          placeholder="Your password"
          value={password}
          error={errors.password ?? passwordError}
          onChange={(e) => {
            setSkipLiveSubmitGate(false)
            setPassword(e.target.value)
            setErrors((current) => ({ ...current, password: undefined, form: undefined }))
          }}
          onFocus={passwordHandlers.onFocus}
          onBlur={() => {
            setTouched((t) => ({ ...t, password: true }))
            passwordHandlers.onBlur()
          }}
          required
        />

        <div className={styles.row}>
          <Checkbox label="Remember me" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <Link to="/forgot-password" className={styles.inlineLink}>
            Forgot password?
          </Link>
        </div>

        {errors.form && (
          <p className={styles.formError} role="alert">
            <Icon name="alert" size={15} /> {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={loading} disabled={!canSubmit} iconRight="arrowRight">
          Sign in
        </Button>
        <ButtonLink to="/demo-login" variant="ghost" size="lg" fullWidth iconLeft="users">
          Demo login
        </ButtonLink>
      </form>

      <p className={styles.hint}>
        <Icon name="info" size={13} /> Demo mode: use <code>maya</code> or <code>maya@demo.aurora</code> / <code>demo1234</code>.
      </p>
    </AuthCard>
  )
}
