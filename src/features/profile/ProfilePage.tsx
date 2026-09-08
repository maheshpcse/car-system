import { lazy, Suspense, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageTransition } from '@/animations/PageTransition'
import { useAuth } from '@/core/auth/AuthProvider'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { formatDate } from '@/core/utils/format'
import { AvatarMoodProvider } from '@/features/auth/avatarMood'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { Button, ButtonLink } from '@/shared/ui/Button'
import { Card, Stat } from '@/shared/ui/Card'
import { TextInput } from '@/shared/ui/Field'
import styles from './ProfilePage.module.scss'

const AvatarScene = lazy(() => import('@/three/avatar/AvatarScene'))

export default function ProfilePage() {
  useDocumentTitle('Profile')
  const { user, updateProfile, logout } = useAuth()
  const { favorites, compare, savedBuilds } = usePreferences()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user?.name ?? '', title: user?.title ?? '', location: user?.location ?? '' })
  const [mood, setMood] = useState<'idle' | 'happy' | 'attentive'>('idle')

  if (!user) return null

  const save = (e: FormEvent) => {
    e.preventDefault()
    updateProfile(form)
    setMood('happy')
    notify('Profile updated', 'success')
    window.setTimeout(() => setMood('idle'), 1500)
  }

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <section className={styles.hero}>
          <div className={styles.avatar} aria-hidden="true">
            <AvatarMoodProvider>
              <Suspense fallback={null}>
                <AvatarScene mood={mood} focus={null} seed={user.avatarSeed} />
              </Suspense>
            </AvatarMoodProvider>
          </div>
          <div className={styles.heroText}>
            <span className="t-eyebrow">{user.title}</span>
            <h1 className="t-title">{user.name}</h1>
            <p className={styles.meta}>
              <Icon name="mail" size={14} /> {user.email}
              <span aria-hidden="true">·</span>
              <Icon name="globe" size={14} /> {user.location}
              <span aria-hidden="true">·</span>
              <Icon name="calendar" size={14} /> Member since {formatDate(user.joinedAt)}
            </p>
            <div className={styles.stats}>
              <Stat label="Favourites" value={String(favorites.length)} />
              <Stat label="Comparing" value={String(compare.length)} />
              <Stat label="Saved builds" value={String(savedBuilds.length)} />
            </div>
          </div>
        </section>

        <div className={styles.grid}>
          <Card padding="lg" className={styles.card}>
            <h2 className="t-card-title">Personal details</h2>
            <form className={styles.form} onSubmit={save}>
              <TextInput label="Full name" iconLeft="user" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onFocus={() => setMood('attentive')} onBlur={() => setMood('idle')} required />
              <TextInput label="Title" iconLeft="sparkle" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} onFocus={() => setMood('attentive')} onBlur={() => setMood('idle')} />
              <TextInput label="Location" iconLeft="globe" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} onFocus={() => setMood('attentive')} onBlur={() => setMood('idle')} />
              <TextInput label="Email" iconLeft="mail" value={user.email} disabled hint="Email is fixed for demo accounts." />
              <div className={styles.formActions}>
                <Button type="submit" iconLeft="check">
                  Save changes
                </Button>
              </div>
            </form>
          </Card>

          <div className={styles.side}>
            <Card padding="md" className={styles.card}>
              <h2 className="t-card-title">Shortcuts</h2>
              <ul className={styles.links}>
                <li>
                  <ButtonLink to="/saved-builds" variant="ghost" fullWidth iconLeft="bookmark">
                    Saved builds
                  </ButtonLink>
                </li>
                <li>
                  <ButtonLink to="/favorites" variant="ghost" fullWidth iconLeft="heart">
                    Favourites
                  </ButtonLink>
                </li>
                <li>
                  <ButtonLink to="/compare" variant="ghost" fullWidth iconLeft="compare">
                    Comparison
                  </ButtonLink>
                </li>
                <li>
                  <ButtonLink to="/settings" variant="ghost" fullWidth iconLeft="settings">
                    Settings
                  </ButtonLink>
                </li>
              </ul>
            </Card>
            <Card padding="md" tone="muted" className={styles.card}>
              <h2 className="t-card-title">Session</h2>
              <p className={styles.sessionText}>You are signed in with a demo account. Signing out clears the session but keeps favourites and builds in this browser.</p>
              <Button
                variant="danger"
                iconLeft="logOut"
                onClick={async () => {
                  await logout()
                  notify('Signed out')
                  navigate('/')
                }}
              >
                Sign out
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
