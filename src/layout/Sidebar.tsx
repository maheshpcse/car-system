import { motion, useReducedMotion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/core/auth/AuthProvider'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { cx } from '@/core/utils/cx'
import { Icon } from '@/shared/icons/Icon'
import { Brand } from './Brand'
import { ACCOUNT_NAV, PERSONAL_NAV, PRIMARY_NAV, type NavItem } from './navigation'
import styles from './Sidebar.module.scss'

interface SidebarProps {
  /** Mobile drawer mode: always expanded, closes on navigation. */
  drawer?: boolean
  onNavigate?: () => void
}

export function Sidebar({ drawer = false, onNavigate }: SidebarProps) {
  const { sidebarCollapsed, setSidebarCollapsed, favorites, compare } = usePreferences()
  const { isAuthenticated } = useAuth()
  const reduced = useReducedMotion()
  const collapsed = !drawer && sidebarCollapsed

  const counts: Record<string, number> = { '/favorites': favorites.length, '/compare': compare.length }

  const renderItem = (item: NavItem) => {
    if (item.protected && !isAuthenticated) return null
    const count = counts[item.to]
    return (
      <li key={item.to}>
        <NavLink
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) => cx(styles.link, isActive && styles.active)}
          title={collapsed ? item.label : undefined}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId={drawer ? 'sidebar-marker-drawer' : 'sidebar-marker'}
                  className={styles.marker}
                  transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className={styles.icon}>
                <Icon name={item.icon} size={19} />
                {collapsed && count ? <span className={styles.dot} /> : null}
              </span>
              <span className={styles.label}>{item.label}</span>
              {!collapsed && count ? <span className={styles.count}>{count}</span> : null}
            </>
          )}
        </NavLink>
      </li>
    )
  }

  return (
    <nav className={cx(styles.sidebar, collapsed && styles.collapsed, drawer && styles.drawer)} aria-label="Primary">
      {!drawer && (
        <div className={styles.top}>
          <Brand compact={collapsed} />
        </div>
      )}

      <div className={styles.groups}>
        <ul className={styles.group}>{PRIMARY_NAV.map(renderItem)}</ul>
        <div className={styles.groupTitle}>
          <span>Personal</span>
        </div>
        <ul className={styles.group}>{PERSONAL_NAV.map(renderItem)}</ul>
        <div className={styles.groupTitle}>
          <span>Account</span>
        </div>
        <ul className={styles.group}>{ACCOUNT_NAV.map(renderItem)}</ul>
      </div>

      {!drawer && (
        <div className={styles.bottom}>
          <button
            type="button"
            className={styles.collapse}
            onClick={() => setSidebarCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={17} />
            <span className={styles.label}>Collapse</span>
          </button>
        </div>
      )}
    </nav>
  )
}
