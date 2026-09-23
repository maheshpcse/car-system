export type NotificationKind = 'info' | 'success' | 'vehicle' | 'system' | 'offer'

export interface AppNotification {
  id: string
  title: string
  detail: string
  createdAt: string
  read: boolean
  href?: string
  kind?: NotificationKind
  audience?: string
  offer?: { label?: string; cta?: string } | null
}
