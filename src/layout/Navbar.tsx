import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/AuthProvider'
import { cx } from '@/core/utils/cx'
import { NotificationPanel } from '@/features/notifications/NotificationPanel'
import { useNotifications } from '@/features/notifications/NotificationsProvider'
import { GlobalSearch } from '@/features/search/GlobalSearch'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { Avatar } from '@/shared/ui/Avatar'
import { Button, ButtonLink, IconButton } from '@/shared/ui/Button'
import { MenuDivider, MenuItem, Popover } from '@/shared/ui/Popover'
import { useTheme } from '@/theme/ThemeProvider'
import { Brand } from './Brand'
import { PAGE_TITLES } from './navigation'
import styles from './Navbar.module.scss'

interface NavbarProps {
  onOpenMenu: () => void
}

export function Navbar({ onOpenMenu }: NavbarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { notify } = useToast()
  const { unreadCount } = useNotifications()
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
            <span className={styles.bell}>
              <IconButton
                icon="bell"
                label="Notifications"
                onClick={() => setNotifOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={notifOpen}
                className={cx(unreadCount > 0 && styles.bellUnread)}
              />
              {unreadCount > 0 && <span className={styles.bellCount}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </span>
          }
        >
          <NotificationPanel onClose={() => setNotifOpen(false)} />
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
