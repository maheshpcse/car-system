import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { cx } from '@/core/utils/cx'
import { authService } from '@/services/authService'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { Button, ButtonLink } from '@/shared/ui/Button'
import { OTPInput, PasswordInput, TextInput } from '@/shared/ui/Field'
import { AuthCard } from './AuthCard'
import { useAvatarFieldHandlers, useAvatarMood } from './avatarMood'
import { validateEmail, validatePassword } from './validation'
import styles from './AuthForms.module.scss'

type Step = 'email' | 'verify' | 'success'
const STEPS: { id: Step; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'verify', label: 'Verify' },
  { id: 'success', label: 'Done' },
]

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset password')
  const { notify } = useToast()
  const { setMood } = useAvatarMood()
  const navigate = useNavigate()
  const reduced = useReducedMotion()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [hintCode, setHintCode] = useState<string | null>(null)
  const [error, setError] = useState<string | undefined>()
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)

  const attentive = useAvatarFieldHandlers('attentive')
  const shy = useAvatarFieldHandlers('shy')
  const stepIndex = STEPS.findIndex((s) => s.id === step)

  const sendCode = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (validateEmail(email)) return
    setLoading(true)
    setError(undefined)
    setMood('thinking')
    try {
      const { code } = await authService.requestPasswordReset(email)
      setHintCode(code)
      setStep('verify')
      setMood('attentive')
      notify('Verification code sent', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code.')
      setMood('sad')
    } finally {
      setLoading(false)
    }
  }

  const verify = async (e: FormEvent) => {
    e.preventDefault()
    if (code.length < 6 || validatePassword(password, 8)) {
      setError(code.length < 6 ? 'Enter the 6-digit code.' : validatePassword(password, 8))
      return
    }
    setLoading(true)
    setError(undefined)
    setMood('thinking')
    try {
      const ok = await authService.verifyResetCode(email, code)
      if (!ok) {
        setError('That code is not valid. Check the hint below and try again.')
        setMood('sad')
        return
      }
      setStep('success')
      setMood('happy')
    } finally {
      setLoading(false)
    }
  }

  const variants = reduced ? undefined : { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -16 } }

  return (
    <AuthCard
      eyebrow="Account recovery"
      title={step === 'success' ? 'Password updated' : 'Reset your password'}
      description={
        step === 'email'
          ? 'Enter the email linked to your account and we will send a verification code.'
          : step === 'verify'
            ? `We sent a 6-digit code to ${email}. Enter it with your new password.`
            : undefined
      }
      footer={
        step !== 'success' ? (
          <>
            <span>Remembered it?</span>
            <Link to="/login">Back to sign in</Link>
          </>
        ) : undefined
      }
    >
      <div className={styles.steps} aria-label="Progress">
        {STEPS.map((s, i) => (
          <span key={s.id} className={cx(styles.step, i === stepIndex && styles.stepActive, i < stepIndex && styles.stepDone)} aria-current={i === stepIndex ? 'step' : undefined}>
            {s.label}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 'email' && (
          <motion.form key="email" className={styles.form} onSubmit={sendCode} noValidate {...variants} transition={{ duration: 0.25 }}>
            <TextInput
              label="Email"
              type="email"
              autoComplete="email"
              iconLeft="mail"
              placeholder="you@example.com"
              value={email}
              error={touched ? validateEmail(email) : undefined}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={attentive.onFocus}
              onBlur={() => {
                setTouched(true)
                attentive.onBlur()
              }}
              required
            />
            {error && (
              <p className={styles.formError} role="alert">
                <Icon name="alert" size={15} /> {error}
              </p>
            )}
            <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading || Boolean(validateEmail(email))} iconRight="send">
              Send verification code
            </Button>
          </motion.form>
        )}

        {step === 'verify' && (
          <motion.form key="verify" className={styles.form} onSubmit={verify} noValidate {...variants} transition={{ duration: 0.25 }}>
            <OTPInput value={code} onChange={setCode} disabled={loading} />
            {hintCode && (
              <p className={styles.codeHint}>
                Demo hint: the code is <code>{hintCode}</code>.
              </p>
            )}
            <PasswordInput
              label="New password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={shy.onFocus}
              onBlur={shy.onBlur}
              required
            />
            {error && (
              <p className={styles.formError} role="alert">
                <Icon name="alert" size={15} /> {error}
              </p>
            )}
            <Button type="submit" size="lg" fullWidth loading={loading} disabled={loading || code.length < 6 || password.length < 8} iconRight="check">
              Update password
            </Button>
            <Button type="button" variant="text" onClick={() => { setStep('email'); setCode(''); setError(undefined) }}>
              Use a different email
            </Button>
          </motion.form>
        )}

        {step === 'success' && (
          <motion.div key="success" className={styles.success} {...variants} transition={{ duration: 0.25 }}>
            <span className={styles.successIcon}>
              <Icon name="check" size={24} strokeWidth={2.2} />
            </span>
            <p className="t-description">
              Your password has been reset. In demo mode no data leaves your browser — sign in with any demo persona to continue.
            </p>
            <ButtonLink to="/login" size="lg" iconRight="arrowRight">
              Continue to sign in
            </ButtonLink>
            <Button variant="text" onClick={() => navigate('/')}>
              Back to the studio
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  )
}
