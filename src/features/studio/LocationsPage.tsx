import { useEffect, useState } from 'react'
import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { studioService } from '@/services/studioService'
import type { Dealership } from '@/data/studio'
import { Icon } from '@/shared/icons/Icon'
import { Card } from '@/shared/ui/Card'
import buttonStyles from '@/shared/ui/Button.module.scss'
import { IndiaShowroomMap } from './IndiaShowroomMap'
import styles from './CollectionPage.module.scss'
import mapStyles from './LocationsPage.module.scss'

export default function LocationsPage() {
  useDocumentTitle('Showrooms', 'Live OpenStreetMap of Aurora Motors studios across India.')
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
            <h1 className="t-title">Showrooms & live maps</h1>
            <p className="t-description">
              Real Indian studio addresses on a live OpenStreetMap. The map stays full width with a fixed height so the page does not grow with the list.
            </p>
          </div>
          {selected && (
            <a
              className={`${buttonStyles.button} ${buttonStyles.primary} ${buttonStyles.md}`}
              href={`https://www.openstreetmap.org/?mlat=${selected.latitude}&mlon=${selected.longitude}#map=16/${selected.latitude}/${selected.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className={buttonStyles.content}>
                <Icon name="mapPin" size={17} />
                Open this address
              </span>
            </a>
          )}
        </header>

        <IndiaShowroomMap places={places} selected={selected} onSelect={setActive} />

        <ul className={mapStyles.list}>
          {places.map((place) => (
            <li key={place.id}>
              <Card padding="md" interactive className={`${mapStyles.placeCard} ${place.id === selected?.id ? mapStyles.cardActive : ''}`} onClick={() => setActive(place.id)}>
                <h2 className="t-card-title">{place.name}</h2>
                <p>{place.address}</p>
                <p>
                  {place.city}, {place.region} · {place.phone}
                </p>
                <p>{place.hours}</p>
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
    </PageTransition>
  )
}
