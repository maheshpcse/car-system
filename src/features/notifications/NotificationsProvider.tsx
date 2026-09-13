import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AppNotification } from '@/models/notification'
import { notificationService } from '@/services/notificationService'

interface NotificationsContextValue {
  items: AppNotification[]
  unreadCount: number
  loading: boolean
  refresh: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
  clear: () => Promise<void>
  enablePush: () => Promise<boolean>
  pushEnabled: boolean
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

const seenIds = new Set<string>()
let seeded = false

function pushBrowser(n: AppNotification) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    const note = new Notification(n.title, { body: n.detail, tag: n.id })
    note.onclick = () => {
      window.focus()
      if (n.href) window.location.assign(n.href)
    }
  } catch {
    /* permission or unsupported constructor */
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted')
  const mounted = useRef(true)

  const apply = useCallback((next: AppNotification[]) => {
    if (!seeded) {
      next.forEach((n) => seenIds.add(n.id))
      seeded = true
    } else {
      next.forEach((n) => {
        if (!seenIds.has(n.id)) {
          seenIds.add(n.id)
          if (!n.read) pushBrowser(n)
        }
      })
    }
    setItems(next)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const next = await notificationService.list()
      if (mounted.current) apply(next)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [apply])

  useEffect(() => {
    mounted.current = true
    void refresh()
    const timer = window.setInterval(() => void refresh(), 60_000)
    return () => {
      mounted.current = false
      window.clearInterval(timer)
    }
  }, [refresh])

  const markRead = useCallback(async (id: string) => apply(await notificationService.markRead(id)), [apply])
  const markAllRead = useCallback(async () => apply(await notificationService.markAllRead()), [apply])
  const remove = useCallback(async (id: string) => apply(await notificationService.remove(id)), [apply])
  const clear = useCallback(async () => apply(await notificationService.clear()), [apply])

  const enablePush = useCallback(async () => {
    if (!('Notification' in window)) return false
    const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
    const ok = permission === 'granted'
    setPushEnabled(ok)
    if (ok && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready.catch(() => null)
        const sub = await reg?.pushManager?.subscribe({ userVisibleOnly: true, applicationServerKey: undefined }).catch(() => null)
        if (sub) await notificationService.subscribePush(sub.toJSON())
      } catch {
        /* subscription is optional until the backend publishes a VAPID key */
      }
    }
    return ok
  }, [])

  const value = useMemo<NotificationsContextValue>(
    () => ({
      items,
      unreadCount: items.filter((n) => !n.read).length,
      loading,
      refresh,
      markRead,
      markAllRead,
      remove,
      clear,
      enablePush,
      pushEnabled,
    }),
    [items, loading, refresh, markRead, markAllRead, remove, clear, enablePush, pushEnabled],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
