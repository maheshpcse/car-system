import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { ButtonLink } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import styles from './NotFoundPage.module.scss'

interface NotFoundPageProps {
  title?: string
  description?: string
}

export default function NotFoundPage({
  title = 'This road does not exist',
  description = 'The page you were looking for has moved or never left the studio. Head back to the line-up or the showroom.',
}: NotFoundPageProps) {
  useDocumentTitle(title)
  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <span className={styles.code} aria-hidden="true">
          404
        </span>
        <EmptyState
          icon="car"
          title={title}
          description={description}
          action={
            <>
              <ButtonLink to="/cars" iconRight="arrowRight">
                Explore cars
              </ButtonLink>
              <ButtonLink to="/" variant="ghost">
                Back home
              </ButtonLink>
            </>
          }
        />
      </div>
    </PageTransition>
  )
}
