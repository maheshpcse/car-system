import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { formatDate, formatPrice } from '@/core/utils/format'
import { getVehicleById } from '@/data/vehicles'
import { useToast } from '@/shared/feedback/ToastProvider'
import { ButtonLink, IconButton } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { VehicleSilhouette } from '@/shared/vehicle/VehicleSilhouette'
import styles from './SavedBuildsPage.module.scss'

export default function SavedBuildsPage() {
  useDocumentTitle('Saved Builds')
  const { savedBuilds, removeBuild } = usePreferences()
  const { notify } = useToast()

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.header}>
          <div>
            <span className="t-eyebrow">Your garage</span>
            <h1 className="t-title">Saved builds</h1>
          </div>
          <ButtonLink to="/configurator" variant="ghost" iconLeft="palette">
            New build
          </ButtonLink>
        </header>

        {savedBuilds.length === 0 ? (
          <EmptyState
            icon="bookmark"
            title="No saved builds yet"
            description="Configure a vehicle and save it here. Builds are stored in your browser for this demo."
            action={
              <ButtonLink to="/configurator" iconRight="arrowRight">
                Open the configurator
              </ButtonLink>
            }
          />
        ) : (
          <ul className={styles.list}>
            {savedBuilds.map((b) => {
              const vehicle = getVehicleById(b.vehicleId)
              if (!vehicle) return null
              const color = vehicle.colors.find((c) => c.id === b.colorId) ?? vehicle.colors[0]
              const wheel = vehicle.wheels.find((w) => w.id === b.wheelId)
              const interior = vehicle.interiors.find((i) => i.id === b.interiorId)
              return (
                <li key={b.id} className={styles.item}>
                  <div className={styles.visual}>
                    <VehicleSilhouette profile={vehicle.silhouette} color={color.hex} />
                  </div>
                  <div className={styles.body}>
                    <span className={styles.date}>Saved {formatDate(b.createdAt)}</span>
                    <h2 className={styles.name}>{b.name}</h2>
                    <p className={styles.spec}>
                      {vehicle.variants.find((v) => v.id === b.variantId)?.name} · {wheel?.name} · {interior?.name}
                      {b.accessoryIds.length > 0 && ` · ${b.accessoryIds.length} accessor${b.accessoryIds.length === 1 ? 'y' : 'ies'}`}
                    </p>
                    <span className={styles.price}>{formatPrice(b.totalPrice)}</span>
                  </div>
                  <div className={styles.actions}>
                    <ButtonLink to={`/configurator/${vehicle.id}?build=${b.id}`} size="sm" iconRight="arrowRight">
                      Open
                    </ButtonLink>
                    <IconButton
                      icon="trash"
                      label="Delete build"
                      size="sm"
                      onClick={() => {
                        removeBuild(b.id)
                        notify('Build removed')
                      }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PageTransition>
  )
}
