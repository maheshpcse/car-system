import { useMemo } from 'react'
import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import type { ListingKind, VehicleFilters } from '@/models/vehicle'
import { EmptyState } from '@/shared/ui/EmptyState'
import { ButtonLink } from '@/shared/ui/Button'
import { VehicleCard, VehicleCardSkeleton } from '@/shared/vehicle/VehicleCard'
import { DEFAULT_FILTERS, useVehicleQuery } from '@/features/cars/useVehicleQuery'
import styles from './CollectionPage.module.scss'

interface CollectionPageProps {
  kind: ListingKind
  title: string
  eyebrow: string
  description: string
  extraAction?: { to: string; label: string }
}

export default function CollectionPage({ kind, title, eyebrow, description, extraAction }: CollectionPageProps) {
  useDocumentTitle(title, description)
  const filters = useMemo<VehicleFilters>(
    () => ({
      ...DEFAULT_FILTERS,
      listingKind: kind,
      minYear: 0,
      priceRange: [0, 1_000_000],
    }),
    [kind],
  )
  const { results, loading } = useVehicleQuery(filters, 'recommended')

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.banner}>
          <div className={styles.bannerText}>
            <span className="t-eyebrow">{eyebrow}</span>
            <h1 className="t-title">{title}</h1>
            <p className="t-description">{description}</p>
          </div>
          {extraAction ? (
            <ButtonLink to={extraAction.to} iconRight="arrowRight">
              {extraAction.label}
            </ButtonLink>
          ) : null}
        </header>
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <VehicleCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <EmptyState icon="car" title="Nothing in this line-up yet" description="Check back as the studio catalogue updates." />
        ) : (
          <div className={styles.grid}>
            {results.map((vehicle, index) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}

export function UsedCarsPage() {
  return (
    <CollectionPage
      kind="USED"
      eyebrow="Pre-owned"
      title="Used cars"
      description="Certified and studio-inspected cars with odometer, owners and condition listed as live data."
      extraAction={{ to: '/sell', label: 'Sell a car' }}
    />
  )
}

export function UpcomingCarsPage() {
  return (
    <CollectionPage
      kind="UPCOMING"
      eyebrow="Preview"
      title="Upcoming cars"
      description="Concept and pre-production cars with expected launch windows, still fully specified."
    />
  )
}

export function VintageCarsPage() {
  return (
    <CollectionPage
      kind="VINTAGE"
      eyebrow="Heritage"
      title="Vintage cars"
      description="Authenticated archive cars for viewing, driving in the showroom, and selling through the studio desk."
      extraAction={{ to: '/sell', label: 'Consign a car' }}
    />
  )
}
