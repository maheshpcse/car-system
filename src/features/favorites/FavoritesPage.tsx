import { useMemo } from 'react'
import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { formatPrice } from '@/core/utils/format'
import { vehicles } from '@/data/vehicles'
import { ButtonLink } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Segmented } from '@/shared/ui/Segmented'
import { VehicleCard } from '@/shared/vehicle/VehicleCard'
import styles from './FavoritesPage.module.scss'

export default function FavoritesPage() {
  useDocumentTitle('Favorites')
  const { favorites, viewMode, setViewMode } = usePreferences()
  const list = useMemo(() => favorites.map((id) => vehicles.find((v) => v.id === id)).filter((v) => v !== undefined), [favorites])
  const total = list.reduce((s, v) => s + v.price, 0)

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.header}>
          <div>
            <span className="t-eyebrow">Saved for later</span>
            <h1 className="t-title">Favourites</h1>
            {list.length > 0 && (
              <p className="t-description">
                {list.length} vehicle{list.length === 1 ? '' : 's'} · combined from {formatPrice(total)}
              </p>
            )}
          </div>
          {list.length > 0 && (
            <Segmented
              label="Layout"
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'grid', label: 'Grid', icon: 'grid', iconOnly: true },
                { value: 'list', label: 'List', icon: 'list', iconOnly: true },
              ]}
            />
          )}
        </header>

        {list.length === 0 ? (
          <EmptyState
            icon="heart"
            title="No favourites yet"
            description="Tap the heart on any vehicle to keep it here. Favourites stay in this browser for the demo."
            action={
              <>
                <ButtonLink to="/cars" iconRight="arrowRight">
                  Explore cars
                </ButtonLink>
                <ButtonLink to="/showroom" variant="ghost">
                  Visit the showroom
                </ButtonLink>
              </>
            }
          />
        ) : (
          <div className={`${styles.results} ${styles[viewMode]}`}>
            {list.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} mode={viewMode} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
