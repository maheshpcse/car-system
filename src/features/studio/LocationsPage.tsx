import { useEffect, useState } from 'react'
import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { studioService } from '@/services/studioService'
import type { Dealership } from '@/data/studio'
import { Icon } from '@/shared/icons/Icon'
import { ButtonLink } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import styles from './CollectionPage.module.scss'
import mapStyles from './LocationsPage.module.scss'

export default function LocationsPage() {
  useDocumentTitle('Showrooms', 'Studio locations with maps and 3D drive access.')
  const [places, setPlaces] = useState<Dealership[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    void studioService.dealerships().then((rows) => {
      setPlaces(rows)
      setActive(rows[0]?.id ?? null)
    })
  }, [])

  const selected = places.find((place) => place.id === active) ?? places[0]

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.banner}>
          <div className={styles.bannerText}>
            <span className="t-eyebrow">Places</span>
            <h1 className="t-title">Showrooms & maps</h1>
            <p className="t-description">Illustrated studio map with live dealership data. Open the 3D floor or take a drive-mode lap from any location.</p>
          </div>
          <ButtonLink to="/showroom?mode=drive" iconLeft="road">
            3D drive view
          </ButtonLink>
        </header>

        <div className={mapStyles.layout}>
          <div className={mapStyles.map} role="img" aria-label="Illustrated showroom map">
            <span className={mapStyles.road} />
            <span className={mapStyles.roadB} />
            {places.map((place) => (
              <button
                key={place.id}
                type="button"
                className={`${mapStyles.pin} ${place.id === selected?.id ? mapStyles.pinActive : ''}`}
                style={{ left: `${place.mapX}%`, top: `${place.mapY}%` }}
                onClick={() => setActive(place.id)}
                aria-pressed={place.id === selected?.id}
              >
                <Icon name="mapPin" size={16} />
                <span>{place.city}</span>
              </button>
            ))}
          </div>
          <ul className={mapStyles.list}>
            {places.map((place) => (
              <li key={place.id}>
                <Card padding="md" interactive className={place.id === selected?.id ? mapStyles.cardActive : undefined} onClick={() => setActive(place.id)}>
                  <h2 className="t-card-title">{place.name}</h2>
                  <p>
                    {place.address} · {place.region}
                  </p>
                  <p>
                    {place.phone} · {place.hours}
                  </p>
                  <div className={styles.chips}>
                    {place.services.map((service) => (
                      <span key={service} className="badge">
                        {service}
                      </span>
                    ))}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageTransition>
  )
}
