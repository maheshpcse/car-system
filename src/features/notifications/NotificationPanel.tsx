import { useNavigate } from 'react-router-dom'
import { formatDate } from '@/core/utils/format'
import { cx } from '@/core/utils/cx'
import { useNotifications } from '@/features/notifications/NotificationsProvider'
import { Button } from '@/shared/ui/Button'
import { MenuLabel } from '@/shared/ui/Popover'
import styles from './NotificationPanel.module.scss'

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { items, unreadCount, markRead, markAllRead, clear } = useNotifications()
  const navigate = useNavigate()
  const preview = items.slice(0, 5)

  return (
    <div className={styles.panel}>
      <div className={styles.head}>
        <MenuLabel>Notifications{unreadCount > 0 ? ` · ${unreadCount}` : ''}</MenuLabel>
        <div className={styles.headActions}>
          <button type="button" className={styles.textBtn} onClick={() => void markAllRead()} disabled={unreadCount === 0}>
            Mark all read
          </button>
          <button type="button" className={styles.textBtn} onClick={() => void clear()} disabled={items.length === 0}>
            Clear
          </button>
        </div>
      </div>
      {preview.length === 0 ? (
        <p className={styles.empty}>You are up to date.</p>
      ) : (
        <ul className={styles.list}>
          {preview.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={cx(styles.item, !n.read && styles.unread)}
                onClick={async () => {
                  await markRead(n.id)
                  onClose()
                  navigate(n.href ?? '/notifications')
                }}
              >
                <span className={styles.dot} />
                <span>
                  <strong>{n.title}</strong>
                  <em>{n.detail}</em>
                  <time dateTime={n.createdAt}>{formatDate(n.createdAt)}</time>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button
        variant="ghost"
        size="sm"
        fullWidth
        onClick={() => {
          onClose()
          navigate('/notifications')
        }}
      >
        View all
      </Button>
    </div>
  )
}
