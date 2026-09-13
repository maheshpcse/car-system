import type { IconName } from '@/shared/icons/Icon'
import { apiClient } from './apiClient'

/**
 * Navigation API contract (backend to implement):
 *   GET /navigation
 *   → { groups: NavGroup[] }
 *
 * Icons must match the front-end IconName set. Unknown icons fall back to `car`.
 */
export interface RemoteNavItem {
  id: string
  to: string
  label: string
  icon: IconName
  protected?: boolean
  end?: boolean
}

export interface NavGroup {
  id: string
  label?: string
  items: RemoteNavItem[]
}

export const DEFAULT_NAV: NavGroup[] = [
  {
    id: 'primary',
    items: [
      { id: 'home', to: '/', label: 'Home', icon: 'home', end: true },
      { id: 'showroom', to: '/showroom', label: 'Showroom', icon: 'showroom' },
      { id: 'cars', to: '/cars', label: 'Explore Cars', icon: 'car' },
      { id: 'categories', to: '/categories', label: 'Categories', icon: 'layers' },
    ],
  },
  {
    id: 'personal',
    label: 'Personal',
    items: [
      { id: 'favorites', to: '/favorites', label: 'Favorites', icon: 'heart' },
      { id: 'compare', to: '/compare', label: 'Compare', icon: 'compare' },
      { id: 'configurator', to: '/configurator', label: 'Configurator', icon: 'palette' },
      { id: 'notifications', to: '/notifications', label: 'Notifications', icon: 'bell' },
      { id: 'saved-builds', to: '/saved-builds', label: 'Saved Builds', icon: 'bookmark', protected: true },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { id: 'profile', to: '/profile', label: 'Profile', icon: 'user', protected: true },
      { id: 'settings', to: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

export const navigationService = {
  async list(): Promise<NavGroup[]> {
    if (!apiClient.enabled) return DEFAULT_NAV
    try {
      const result = await apiClient.request<NavGroup[] | { groups: NavGroup[] }>('/navigation')
      const groups = Array.isArray(result.data) ? result.data : result.data.groups
      return groups?.length ? groups : DEFAULT_NAV
    } catch {
      return DEFAULT_NAV
    }
  },
}
