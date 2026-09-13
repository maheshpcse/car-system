import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/AuthProvider'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { AuthError } from '@/services/authService'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { Button, ButtonLink } from '@/shared/ui/Button'
import { Checkbox, PasswordInput, TextInput } from '@/shared/ui/Field'
import { AuthCard, OrDivider, SocialPlaceholders } from './AuthCard'
import { useAvatarFieldHandlers, useAvatarMood } from './avatarMood'
import { validatePassword, validateUsername } from './validation'
import styles from './AuthForms.module.scss'

export default function LoginPage() {
  useDocumentTitle('Sign in')
  const { login } = useAuth()
  const { notify } = useToast()
  const { setMood } = useAvatarMood()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ username?: string; password?: string; form?: string }>({})
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({})
  const [loading, setLoading] = useState(false)

  const usernameHandlers = useAvatarFieldHandlers('attentive')
  const passwordHandlers = useAvatarFieldHandlers('shy')

  const usernameError = touched.username ? validateUsername(username) : undefined
  const passwordError = touched.password ? validatePassword(password) : undefined
  const canSubmit = !validateUsername(username) && !validatePassword(password) && !loading

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ username: true, password: true })
    if (validateUsername(username) || validatePassword(password)) return
    setLoading(true)
    setErrors({})
    setMood('thinking')
    try {
      const user = await login({ username, password, remember })
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
      description="Pick up saved builds, favourites and comparisons across devices."
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
        <TextInput
          label="Username"
          name="username"
          autoComplete="username"
          iconLeft="user"
          placeholder="maya"
          value={username}
          error={errors.username ?? usernameError}
          onChange={(e) => setUsername(e.target.value)}
          onFocus={usernameHandlers.onFocus}
          onBlur={() => {
            setTouched((t) => ({ ...t, username: true }))
            usernameHandlers.onBlur()
          }}
          required
        />
        <PasswordInput
          label="Password"
          name="password"
          placeholder="Your password"
          value={password}
          error={errors.password ?? passwordError}
          onChange={(e) => setPassword(e.target.value)}
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
        <Icon name="info" size={13} /> Demo mode: use <code>maya</code> / <code>demo1234</code>, or any unique username with a 6+ character password.
      </p>
    </AuthCard>
  )
}
