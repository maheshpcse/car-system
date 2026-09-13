import { apiClient } from './apiClient'
import type { AppNotification } from '@/models/notification'

/**
 * Notifications API contract (backend to implement):
 *   GET    /notifications
 *   GET    /notifications/unread-count          → { count: number }
 *   POST   /notifications/:id/read
 *   POST   /notifications/read-all
 *   DELETE /notifications/:id
 *   DELETE /notifications                       (clear all)
 *   POST   /notifications/push-subscribe        { endpoint, keys: { p256dh, auth } }
 */
const SEED: AppNotification[] = [
  {
    id: 'n-x1',
    title: 'Aureon X1 Performance now available',
    detail: 'A new variant has been added to the configurator.',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    read: false,
    href: '/cars/aureon-x1',
    kind: 'vehicle',
  },
  {
    id: 'n-showroom',
    title: 'Showroom lighting updated',
    detail: 'Studio mode now supports dark environments.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: false,
    href: '/showroom',
    kind: 'info',
  },
  {
    id: 'n-build',
    title: 'Your saved build is ready',
    detail: 'Velora GT · Deep Crimson · Forged 21"',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    read: true,
    href: '/saved-builds',
    kind: 'success',
  },
]

let local = SEED.map((n) => ({ ...n }))

const clone = () => local.map((n) => ({ ...n }))

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    if (apiClient.enabled) {
      try {
        const result = await apiClient.request<AppNotification[]>('/notifications')
        return result.data
      } catch {
        /* fall through to local demo store */
      }
    }
    return clone()
  },

  async markRead(id: string): Promise<AppNotification[]> {
    if (apiClient.enabled) {
      try {
        await apiClient.request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' })
        return this.list()
      } catch {
        /* local fallback */
      }
    }
    local = local.map((n) => (n.id === id ? { ...n, read: true } : n))
    return clone()
  },

  async markAllRead(): Promise<AppNotification[]> {
    if (apiClient.enabled) {
      try {
        await apiClient.request('/notifications/read-all', { method: 'POST' })
        return this.list()
      } catch {
        /* local fallback */
      }
    }
    local = local.map((n) => ({ ...n, read: true }))
    return clone()
  },

  async remove(id: string): Promise<AppNotification[]> {
    if (apiClient.enabled) {
      try {
        await apiClient.request(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' })
        return this.list()
      } catch {
        /* local fallback */
      }
    }
    local = local.filter((n) => n.id !== id)
    return clone()
  },

  async clear(): Promise<AppNotification[]> {
    if (apiClient.enabled) {
      try {
        await apiClient.request('/notifications', { method: 'DELETE' })
        return this.list()
      } catch {
        /* local fallback */
      }
    }
    local = []
    return clone()
  },

  async subscribePush(subscription: PushSubscriptionJSON): Promise<void> {
    if (!apiClient.enabled) return
    await apiClient.request('/notifications/push-subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    })
  },
}
