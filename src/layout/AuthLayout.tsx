import { AnimatePresence } from 'framer-motion'
import { Suspense } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AvatarMoodProvider, useAvatarMood } from '@/features/auth/avatarMood'
import { RoboticGuide } from '@/features/auth/RoboticGuide'
import { Icon } from '@/shared/icons/Icon'
import { IconButton } from '@/shared/ui/Button'
import { PageLoader } from '@/shared/feedback/PageLoader'
import { useTheme } from '@/theme/ThemeProvider'
import { Brand } from './Brand'
import styles from './AuthLayout.module.scss'

function AuthVisual() {
  const { mood, focus } = useAvatarMood()
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.visualBackdrop} />
      <RoboticGuide mood={mood} focus={focus} />
      <div className={styles.visualCaption}>
        <span className="t-eyebrow">Line attendant</span>
        <p>A 2D robotic host with a slight 3D turn. No cars on this floor — only the Rekha guide following your cursor.</p>
      </div>
    </div>
  )
}

/**
 * Standalone layout for /login, /signup, /forgot-password and /demo-login.
 * Intentionally excludes the main navbar, sidebar and footer.
 */
export function AuthLayout() {
  const { theme, toggle } = useTheme()
  const location = useLocation()

  return (
    <AvatarMoodProvider>
      <div className={styles.layout}>
        <header className={styles.header}>
          <Brand />
          <div className={styles.headerActions}>
            <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label="Toggle theme" onClick={toggle} />
            <Link to="/" className={styles.back}>
              Back to studio <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </header>

        <div className={styles.grid}>
          <AuthVisual />
          <main className={styles.formColumn} id="main-content">
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait" initial={false}>
                <Outlet key={location.pathname} />
              </AnimatePresence>
            </Suspense>
          </main>
        </div>
      </div>
    </AvatarMoodProvider>
  )
}
