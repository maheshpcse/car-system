import { motion, useReducedMotion } from 'framer-motion'
import { useRef, type PointerEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePreferences } from '@/core/preferences/PreferencesProvider'
import { formatAcceleration, formatPower, formatPrice, formatRange } from '@/core/utils/format'
import { cx } from '@/core/utils/cx'
import { labelFor, FUEL_TYPES, TRANSMISSIONS } from '@/data/categories'
import type { Vehicle, ViewMode } from '@/models/vehicle'
import { useToast } from '@/shared/feedback/ToastProvider'
import { Icon } from '@/shared/icons/Icon'
import { IconButton } from '@/shared/ui/Button'
import { VehicleSilhouette } from './VehicleSilhouette'
import styles from './VehicleCard.module.scss'

interface VehicleCardProps {
  vehicle: Vehicle
  mode?: ViewMode
  index?: number
}

export function VehicleCard({ vehicle, mode = 'grid', index = 0 }: VehicleCardProps) {
  const { isFavorite, toggleFavorite, isCompared, toggleCompare } = usePreferences()
  const { notify } = useToast()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const favorite = isFavorite(vehicle.id)
  const compared = isCompared(vehicle.id)
  const heroColor = vehicle.colors[0]?.hex ?? '#999'

  // Very small tilt (max ~3°) that follows the pointer.
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduced || mode === 'list' || e.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--tilt-x', `${(-py * 3).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(px * 3).toFixed(2)}deg`)
    el.style.setProperty('--shift-x', `${(px * 8).toFixed(1)}px`)
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
    el.style.setProperty('--shift-x', '0px')
  }

  const handleCompare = () => {
    const added = toggleCompare(vehicle.id)
    if (compared) notify('Removed from compare')
    else if (added) notify('Added to compare', 'success')
    else notify('You can compare up to 3 vehicles', 'warning')
  }

  const handleFavorite = () => {
    toggleFavorite(vehicle.id)
    notify(favorite ? 'Removed from favourites' : 'Saved to favourites', favorite ? 'info' : 'success')
  }

  return (
    <motion.article
      ref={ref}
      className={cx(styles.card, styles[mode])}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.04, 0.3) }}
      layout={!reduced}
    >
      <Link
        to={`/cars/${vehicle.id}`}
        className={styles.media}
        aria-label={`Explore ${vehicle.manufacturer} ${vehicle.model}`}
      >
        <div className={styles.mediaInner} style={{ '--tint': heroColor } as React.CSSProperties}>
          <VehicleSilhouette profile={vehicle.silhouette} color={heroColor} className={styles.silhouette} />
        </div>
        <div className={styles.badges}>
          {vehicle.isNew && <span className="badge badge--accent">New</span>}
          {vehicle.fuelType === 'electric' && (
            <span className="badge badge--teal">
              <Icon name="charging" size={11} /> EV
            </span>
          )}
        </div>
      </Link>

      <div className={styles.body}>
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <span className={styles.manufacturer}>
              {vehicle.manufacturer} · {vehicle.year}
            </span>
            <h3 className={styles.title}>
              <Link to={`/cars/${vehicle.id}`}>{vehicle.model}</Link>
            </h3>
            <span className={styles.variant}>{vehicle.variant}</span>
          </div>
          <div className={styles.price}>
            <span className={styles.priceLabel}>From</span>
            <span className={styles.priceValue}>{formatPrice(vehicle.price)}</span>
          </div>
        </header>

        <dl className={styles.specs}>
          <div>
            <dt>
              <Icon name="engine" size={14} /> Power
            </dt>
            <dd>{formatPower(vehicle.power)}</dd>
          </div>
          <div>
            <dt>
              <Icon name={vehicle.fuelType === 'electric' ? 'battery' : 'fuel'} size={14} /> Range
            </dt>
            <dd>{formatRange(vehicle.range)}</dd>
          </div>
          <div>
            <dt>
              <Icon name="speed" size={14} /> 0–100
            </dt>
            <dd>{formatAcceleration(vehicle.acceleration)}</dd>
          </div>
          {mode === 'list' && (
            <>
              <div>
                <dt>
                  <Icon name="transmission" size={14} /> Gearbox
                </dt>
                <dd>{labelFor(TRANSMISSIONS, vehicle.transmission)}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="charging" size={14} /> Powertrain
                </dt>
                <dd>{labelFor(FUEL_TYPES, vehicle.fuelType)}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="seats" size={14} /> Seats
                </dt>
                <dd>{vehicle.seats}</dd>
              </div>
            </>
          )}
        </dl>

        <footer className={styles.actions}>
          <button type="button" className={styles.explore} onClick={() => navigate(`/cars/${vehicle.id}`)}>
            Explore <Icon name="arrowRight" size={15} />
          </button>
          <div className={styles.iconActions}>
            <IconButton icon="rotate360" label="Open 360° view" size="sm" onClick={() => navigate(`/cars/${vehicle.id}#viewer`)} />
            <IconButton icon="compare" label={compared ? 'Remove from compare' : 'Add to compare'} size="sm" active={compared} onClick={handleCompare} />
            <IconButton
              icon="heart"
              label={favorite ? 'Remove from favourites' : 'Save to favourites'}
              size="sm"
              active={favorite}
              filled={favorite}
              className={cx(styles.heart, favorite && styles.heartActive)}
              onClick={handleFavorite}
            />
          </div>
        </footer>
      </div>
    </motion.article>
  )
}

export function VehicleCardSkeleton({ mode = 'grid' }: { mode?: ViewMode }) {
  return (
    <div className={cx(styles.card, styles[mode], styles.skeletonCard)} aria-hidden="true">
      <div className={cx(styles.media, 'skeleton')} />
      <div className={styles.body}>
        <div className="skeleton" style={{ height: 14, width: '40%' }} />
        <div className="skeleton" style={{ height: 22, width: '65%' }} />
        <div className="skeleton" style={{ height: 40 }} />
      </div>
    </div>
  )
}
