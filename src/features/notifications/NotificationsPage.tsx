import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { formatDate } from '@/core/utils/format'
import { cx } from '@/core/utils/cx'
import { useNotifications } from '@/features/notifications/NotificationsProvider'
import { Icon } from '@/shared/icons/Icon'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useNavigate } from 'react-router-dom'
import styles from './NotificationsPage.module.scss'

export default function NotificationsPage() {
  useDocumentTitle('Notifications')
  const { items, unreadCount, markRead, markAllRead, remove, clear, enablePush, pushEnabled } = useNotifications()
  const navigate = useNavigate()

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.header}>
          <div>
            <span className="t-eyebrow">Inbox</span>
            <h1 className="t-title">Notifications</h1>
            <p className="t-description">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You are up to date.'} Company promotions stay public. Turn on email alerts in Settings for car and studio notes.
            </p>
          </div>
          <div className={styles.actions}>
            <Button variant="ghost" size="sm" iconLeft="bell" onClick={() => void enablePush()} disabled={pushEnabled}>
              {pushEnabled ? 'Push enabled' : 'Enable push'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void markAllRead()} disabled={unreadCount === 0}>
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" iconLeft="trash" onClick={() => void clear()} disabled={items.length === 0}>
              Clear
            </Button>
          </div>
        </header>

        {items.length === 0 ? (
          <EmptyState icon="bell" title="No notifications" description="New studio updates will appear here." />
        ) : (
          <ul className={styles.list}>
            {items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  className={cx(styles.item, !n.read && styles.unread)}
                  onClick={async () => {
                    await markRead(n.id)
                    if (n.href) navigate(n.href)
                  }}
                >
                  <span className={styles.dot} aria-hidden="true" />
                  <span className={styles.body}>
                    <strong>{n.title}</strong>
                    <span>{n.detail}</span>
                    <time dateTime={n.createdAt}>{formatDate(n.createdAt)}</time>
                  </span>
                </button>
                <Button variant="ghost" size="sm" onClick={() => void remove(n.id)} aria-label={`Dismiss ${n.title}`}>
                  <Icon name="x" size={14} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageTransition>
  )
}
