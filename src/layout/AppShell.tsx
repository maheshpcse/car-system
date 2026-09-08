import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { cx } from '@/core/utils/cx'
import { GlobalSearch } from '@/features/search/GlobalSearch'
import { ScrollProgress } from '@/shared/scroll/ScrollProgress'
import { IconButton } from '@/shared/ui/Button'
import { PageLoader } from '@/shared/feedback/PageLoader'
import { Brand } from './Brand'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import styles from './AppShell.module.scss'

export function AppShell() {
  const { sidebarCollapsed } = usePreferences()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const reduced = useReducedMotion()

  useEffect(() => setMenuOpen(false), [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <div className={cx(styles.shell, sidebarCollapsed && styles.collapsed)}>
      <a href="#main-content" className={styles.skip}>
        Skip to content
      </a>
      <Sidebar />

      <div className={styles.frame}>
        <Navbar onOpenMenu={() => setMenuOpen(true)} />
        <main id="main-content" className={styles.main} tabIndex={-1}>
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait" initial={false}>
              <Outlet key={location.pathname} />
            </AnimatePresence>
          </Suspense>
        </main>
        <Footer />
      </div>

      <ScrollProgress />

      <AnimatePresence>
        {menuOpen && (
          <div className={styles.drawerRoot}>
            <motion.div
              className={styles.drawerBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className={styles.drawer}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={reduced ? { opacity: 0 } : { x: -24, opacity: 0 }}
              animate={reduced ? { opacity: 1 } : { x: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { x: -24, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.drawerHeader}>
                <Brand />
                <IconButton icon="x" label="Close navigation" onClick={() => setMenuOpen(false)} />
              </div>
              <div className={styles.drawerSearch}>
                <GlobalSearch onNavigate={() => setMenuOpen(false)} />
              </div>
              <Sidebar drawer onNavigate={() => setMenuOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
