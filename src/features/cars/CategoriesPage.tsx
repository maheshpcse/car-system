import { Link } from 'react-router-dom'
import { PageTransition, Reveal } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { formatPriceCompact } from '@/core/utils/format'
import { CATEGORIES } from '@/data/categories'
import { vehicles } from '@/data/vehicles'
import { Icon } from '@/shared/icons/Icon'
import { VehicleSilhouette } from '@/shared/vehicle/VehicleSilhouette'
import styles from './CategoriesPage.module.scss'

export default function CategoriesPage() {
  useDocumentTitle('Categories', 'Browse the Aurora Motors line-up by how you drive.')
  const categories = CATEGORIES.filter((c) => c.id !== 'all')

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.header}>
          <span className="t-eyebrow">Categories</span>
          <h1 className="t-title">Start with how you drive.</h1>
          <p className="t-description">Each category groups vehicles by purpose rather than badge, so the right car is a single decision away.</p>
        </header>

        <ul className={styles.grid}>
          {categories.map((c, i) => {
            const list = vehicles.filter((v) => v.category.includes(c.id as never))
            const lead = list[0]
            const minPrice = Math.min(...list.map((v) => v.price))
            return (
              <Reveal as="li" key={c.id} delay={i * 0.05}>
                <Link to={`/cars?category=${c.id}`} className={styles.card}>
                  <div className={styles.visual}>{lead && <VehicleSilhouette profile={lead.silhouette} color={lead.colors[0].hex} />}</div>
                  <div className={styles.body}>
                    <span className={styles.icon}>
                      <Icon name={c.icon} size={18} />
                    </span>
                    <h2 className={styles.title}>{c.label}</h2>
                    <p className={styles.description}>{c.description}</p>
                    <div className={styles.meta}>
                      <span>
                        {list.length} vehicle{list.length === 1 ? '' : 's'}
                      </span>
                      <span>from {formatPriceCompact(minPrice)}</span>
                    </div>
                    <span className={styles.arrow}>
                      <Icon name="arrowRight" size={16} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </PageTransition>
  )
}
