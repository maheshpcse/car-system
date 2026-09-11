import { cx } from '@/core/utils/cx'
import { Icon } from '@/shared/icons/Icon'
import styles from './Pagination.module.scss'

interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
  total?: number
  pageSize?: number
  className?: string
}

function range(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1])
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

export function Pagination({ page, pageCount, onChange, total, pageSize, className }: PaginationProps) {
  if (pageCount <= 1) return null
  const from = total !== undefined && pageSize ? (page - 1) * pageSize + 1 : undefined
  const to = total !== undefined && pageSize ? Math.min(page * pageSize, total) : undefined

  return (
    <nav className={cx(styles.root, className)} aria-label="Pagination">
      {from !== undefined && (
        <p className={styles.summary}>
          Showing{' '}
          <strong>
            {from}–{to}
          </strong>{' '}
          of {total}
        </p>
      )}
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <Icon name="chevronLeft" size={16} />
        </button>
        <ol className={styles.pages}>
          {range(page, pageCount).map((item, i) =>
            item === 'gap' ? (
              <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  className={cx(styles.pageButton, item === page && styles.current)}
                  onClick={() => onChange(item)}
                  aria-current={item === page ? 'page' : undefined}
                  aria-label={`Page ${item}`}
                >
                  {item}
                </button>
              </li>
            ),
          )}
        </ol>
        <button type="button" className={styles.arrow} onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Next page">
          <Icon name="chevronRight" size={16} />
        </button>
      </div>
    </nav>
  )
}
