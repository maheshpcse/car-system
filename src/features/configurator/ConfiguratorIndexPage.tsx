import { Link } from 'react-router-dom'
import { PageTransition, Reveal } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { formatPrice } from '@/core/utils/format'
import { vehicles } from '@/data/vehicles'
import { Icon } from '@/shared/icons/Icon'
import { VehicleSilhouette } from '@/shared/vehicle/VehicleSilhouette'
import styles from './ConfiguratorIndexPage.module.scss'

export default function ConfiguratorIndexPage() {
  useDocumentTitle('Configurator', 'Pick a vehicle and build it your way.')
  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.header}>
          <span className="t-eyebrow">Configurator</span>
          <h1 className="t-title">Pick a vehicle to build.</h1>
          <p className="t-description">Choose exterior colour, wheels, interior, trim and accessories while the 3D model updates live.</p>
        </header>
        <ul className={styles.grid}>
          {vehicles.map((v, i) => (
            <Reveal as="li" key={v.id} delay={Math.min(i * 0.03, 0.2)}>
              <Link to={`/configurator/${v.id}`} className={styles.card} data-cursor="view" data-cursor-label="Build">
                <div className={styles.visual}>
                  <VehicleSilhouette profile={v.silhouette} color={v.colors[0].hex} />
                </div>
                <div className={styles.body}>
                  <span className={styles.brand}>{v.manufacturer}</span>
                  <strong className={styles.model}>{v.model}</strong>
                  <span className={styles.price}>from {formatPrice(v.price)}</span>
                  <span className={styles.options}>
                    {v.colors.length} colours · {v.wheels.length} wheels · {v.interiors.length} interiors
                  </span>
                </div>
                <Icon name="arrowRight" size={16} className={styles.arrow} />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </PageTransition>
  )
}
