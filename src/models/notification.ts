export type NotificationKind = 'info' | 'success' | 'vehicle' | 'system'

export interface AppNotification {
  id: string
  title: string
  detail: string
  createdAt: string
  read: boolean
  href?: string
  kind?: NotificationKind
}
