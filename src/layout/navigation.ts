import type { IconName } from '@/shared/icons/Icon'

export interface NavItem {
  to: string
  label: string
  icon: IconName
  /** Only shown when authenticated. */
  protected?: boolean
  end?: boolean
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/showroom', label: 'Showroom', icon: 'showroom' },
  { to: '/cars', label: 'Explore Cars', icon: 'car' },
  { to: '/categories', label: 'Categories', icon: 'layers' },
]

export const PERSONAL_NAV: NavItem[] = [
  { to: '/favorites', label: 'Favorites', icon: 'heart' },
  { to: '/compare', label: 'Compare', icon: 'compare' },
  { to: '/configurator', label: 'Configurator', icon: 'palette' },
  { to: '/saved-builds', label: 'Saved Builds', icon: 'bookmark', protected: true },
]

export const ACCOUNT_NAV: NavItem[] = [
  { to: '/profile', label: 'Profile', icon: 'user', protected: true },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

export const PAGE_TITLES: Record<string, string> = {
  '/': 'Home',
  '/showroom': 'Virtual Showroom',
  '/cars': 'Explore Cars',
  '/categories': 'Categories',
  '/favorites': 'Favorites',
  '/compare': 'Compare',
  '/configurator': 'Configurator',
  '/saved-builds': 'Saved Builds',
  '/profile': 'Profile',
  '/settings': 'Settings',
}
