import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/AuthProvider'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { cx } from '@/core/utils/cx'
import { DEMO_PERSONAS } from '@/data/personas'
import type { DemoPersona } from '@/models/user'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { Avatar } from '@/shared/ui/Avatar'
import { Button } from '@/shared/ui/Button'
import { AuthCard } from './AuthCard'
import { useAvatarMood } from './avatarMood'
import styles from './AuthForms.module.scss'

const ROLE_BADGE: Record<DemoPersona['role'], string> = {
  customer: 'badge--primary',
  visitor: 'badge--teal',
  advisor: 'badge--accent',
  admin: 'badge--danger',
}

export default function DemoLoginPage() {
  useDocumentTitle('Demo login')
  const { login } = useAuth()
  const { notify } = useToast()
  const { setMood } = useAvatarMood()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<DemoPersona>(DEMO_PERSONAS[0])
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const enter = async (persona: DemoPersona) => {
    setSelected(persona)
    setLoadingId(persona.id)
    setMood('thinking')
    try {
      await login({ email: persona.email, password: persona.password, remember: true })
      setMood('happy')
      notify(`Signed in as ${persona.name}`, 'success')
      window.setTimeout(() => navigate(persona.role === 'visitor' ? '/showroom' : '/', { replace: true }), 500)
    } catch {
      setMood('sad')
      notify('Demo login failed', 'error')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <AuthCard
      eyebrow="Demo experience"
      title="Choose a persona"
      description="Every persona uses fake credentials and browser storage only. Pick one to explore the studio the way that role would."
      wide
      footer={
        <>
          <span>Prefer a real account?</span>
          <Link to="/signup">Sign up</Link>
          <span aria-hidden="true">·</span>
          <Link to="/login">Sign in</Link>
        </>
      }
    >
      <ul className={styles.personas}>
        {DEMO_PERSONAS.map((persona) => (
          <li key={persona.id}>
            <button
              type="button"
              className={cx(styles.persona, selected.id === persona.id && styles.personaActive)}
              onClick={() => setSelected(persona)}
              onDoubleClick={() => enter(persona)}
              onFocus={() => setMood('attentive')}
              onBlur={() => setMood('idle')}
              disabled={loadingId !== null}
              aria-pressed={selected.id === persona.id}
            >
              <Avatar name={persona.name} seed={persona.avatarSeed} size={44} />
              <span className={styles.personaText}>
                <strong>{persona.name}</strong>
                <span>{persona.description}</span>
              </span>
              <span className={cx('badge', ROLE_BADGE[persona.role], styles.personaRole)}>{persona.title}</span>
              <Icon name="chevronRight" size={16} className={styles.personaArrow} />
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.credentials} aria-live="polite">
        <div>
          <span>Email</span>
          <code>{selected.email}</code>
        </div>
        <div>
          <span>Password</span>
          <code>{selected.password}</code>
        </div>
      </div>

      <Button size="lg" fullWidth loading={loadingId === selected.id} disabled={loadingId !== null} iconRight="arrowRight" onClick={() => enter(selected)}>
        Enter as {selected.title}
      </Button>
    </AuthCard>
  )
}
