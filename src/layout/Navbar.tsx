import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/AuthProvider'
import { cx } from '@/core/utils/cx'
import { GlobalSearch } from '@/features/search/GlobalSearch'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { Avatar } from '@/shared/ui/Avatar'
import { Button, ButtonLink, IconButton } from '@/shared/ui/Button'
import { MenuDivider, MenuItem, MenuLabel, Popover } from '@/shared/ui/Popover'
import { useTheme } from '@/theme/ThemeProvider'
import { Brand } from './Brand'
import { PAGE_TITLES } from './navigation'
import styles from './Navbar.module.scss'

interface NavbarProps {
  onOpenMenu: () => void
}

const NOTIFICATIONS = [
  { id: 1, title: 'Aureon X1 Performance now available', detail: 'New variant added to the configurator.' },
  { id: 2, title: 'Showroom lighting updated', detail: 'Studio mode now supports dark environments.' },
  { id: 3, title: 'Your saved build is ready', detail: 'Velora GT · Deep Crimson · Forged 21"' },
]

export function Navbar({ onOpenMenu }: NavbarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { notify } = useToast()
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const base = '/' + pathname.split('/')[1]
  const title = PAGE_TITLES[pathname] ?? PAGE_TITLES[base] ?? (pathname.startsWith('/cars/') ? 'Vehicle' : pathname.startsWith('/configurator/') ? 'Configurator' : '')

  return (
    <header className={cx(styles.navbar, scrolled && styles.scrolled)}>
      <div className={styles.left}>
        <IconButton icon="menu" label="Open navigation" className={styles.menuButton} onClick={onOpenMenu} />
        <Brand className={styles.mobileBrand} />
        {title && (
          <div className={styles.context}>
            <span className={styles.contextLabel}>{title}</span>
          </div>
        )}
      </div>

      <div className={styles.center}>
        <GlobalSearch />
      </div>

      <div className={styles.right}>
        <ButtonLink to="/showroom" variant="ghost" size="sm" iconLeft="showroom" className={styles.showroom}>
          Showroom
        </ButtonLink>
        <IconButton icon="search" label="Search" className={styles.searchButton} onClick={() => navigate('/cars')} />
        <IconButton
          icon={theme === 'dark' ? 'sun' : 'moon'}
          label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={toggle}
          className={styles.themeButton}
        />

        <Popover
          open={notifOpen}
          onClose={() => setNotifOpen(false)}
          width={320}
          anchor={
            <IconButton
              icon="bell"
              label="Notifications"
              onClick={() => setNotifOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={notifOpen}
              className={styles.bell}
            />
          }
        >
          <MenuLabel>Notifications</MenuLabel>
          <ul className={styles.notifications}>
            {NOTIFICATIONS.map((n) => (
              <li key={n.id} className={styles.notification}>
                <span className={styles.notificationDot} />
                <div>
                  <p className={styles.notificationTitle}>{n.title}</p>
                  <p className={styles.notificationDetail}>{n.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Popover>

        {isAuthenticated && user ? (
          <Popover
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            width={240}
            anchor={
              <button
                type="button"
                className={styles.profile}
                onClick={() => setProfileOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Account menu"
              >
                <Avatar name={user.name} seed={user.avatarSeed} size={32} />
                <span className={styles.profileName}>{user.name.split(' ')[0]}</span>
                <Icon name="chevronDown" size={14} className={styles.profileChevron} />
              </button>
            }
          >
            <div className={styles.profileCard}>
              <Avatar name={user.name} seed={user.avatarSeed} size={40} />
              <div>
                <p className={styles.profileCardName}>{user.name}</p>
                <p className={styles.profileCardMeta}>{user.title}</p>
              </div>
            </div>
            <MenuDivider />
            <MenuItem icon={<Icon name="user" size={16} />} onClick={() => { setProfileOpen(false); navigate('/profile') }}>
              Profile
            </MenuItem>
            <MenuItem icon={<Icon name="bookmark" size={16} />} onClick={() => { setProfileOpen(false); navigate('/saved-builds') }}>
              Saved builds
            </MenuItem>
            <MenuItem icon={<Icon name="settings" size={16} />} onClick={() => { setProfileOpen(false); navigate('/settings') }}>
              Settings
            </MenuItem>
            <MenuDivider />
            <MenuItem
              icon={<Icon name="logOut" size={16} />}
              danger
              onClick={async () => {
                setProfileOpen(false)
                await logout()
                notify('Signed out')
                navigate('/')
              }}
            >
              Sign out
            </MenuItem>
          </Popover>
        ) : (
          <Button size="sm" variant="primary" onClick={() => navigate('/login')} className={styles.login}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  )
}
