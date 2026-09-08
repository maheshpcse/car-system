import { useMemo, useState } from 'react'
import { PageTransition } from '@/animations/PageTransition'
import { useDocumentTitle } from '@/core/hooks/useDocumentTitle'
import { MAX_COMPARE, usePreferences } from '@/core/preferences/PreferencesProvider'
import { cx } from '@/core/utils/cx'
import { formatNumber, formatPrice } from '@/core/utils/format'
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, labelFor } from '@/data/categories'
import { vehicles } from '@/data/vehicles'
import type { Vehicle } from '@/models/vehicle'
import { Icon } from '@/shared/icons/Icon'
import { Button, ButtonLink, IconButton } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Select, Toggle } from '@/shared/ui/Field'
import { VehicleSilhouette } from '@/shared/vehicle/VehicleSilhouette'
import styles from './ComparePage.module.scss'

type Row = { label: string; get: (v: Vehicle) => string | number; better?: 'high' | 'low'; format?: (n: number) => string }

const ROWS: { group: string; rows: Row[] }[] = [
  {
    group: 'Pricing',
    rows: [{ label: 'Starting price', get: (v) => v.price, better: 'low', format: formatPrice }],
  },
  {
    group: 'Performance',
    rows: [
      { label: 'Power', get: (v) => v.power, better: 'high', format: (n) => `${formatNumber(n)} hp` },
      { label: 'Torque', get: (v) => v.torque, better: 'high', format: (n) => `${formatNumber(n)} Nm` },
      { label: '0–100 km/h', get: (v) => v.acceleration, better: 'low', format: (n) => `${n.toFixed(1)} s` },
      { label: 'Top speed', get: (v) => v.topSpeed, better: 'high', format: (n) => `${formatNumber(n)} km/h` },
      { label: 'Range', get: (v) => v.range, better: 'high', format: (n) => `${formatNumber(n)} km` },
    ],
  },
  {
    group: 'Drivetrain',
    rows: [
      { label: 'Powertrain', get: (v) => labelFor(FUEL_TYPES, v.fuelType) },
      { label: 'Transmission', get: (v) => labelFor(TRANSMISSIONS, v.transmission) },
      { label: 'Body', get: (v) => labelFor(BODY_TYPES, v.bodyType) },
    ],
  },
  {
    group: 'Practicality',
    rows: [
      { label: 'Seats', get: (v) => v.seats, better: 'high' },
      { label: 'Cargo', get: (v) => v.dimensions.cargoLiters, better: 'high', format: (n) => `${formatNumber(n)} L` },
      { label: 'Length', get: (v) => v.dimensions.lengthMm, format: (n) => `${formatNumber(n)} mm` },
      { label: 'Weight', get: (v) => v.dimensions.weightKg, better: 'low', format: (n) => `${formatNumber(n)} kg` },
    ],
  },
  {
    group: 'Ownership',
    rows: [
      { label: 'Model year', get: (v) => v.year, better: 'high', format: (n) => String(n) },
      { label: 'Rating', get: (v) => v.rating, better: 'high', format: (n) => `${n.toFixed(1)} / 5` },
      { label: 'Colour options', get: (v) => v.colors.length, better: 'high' },
    ],
  },
]

export default function ComparePage() {
  useDocumentTitle('Compare', 'Compare up to three vehicles side by side.')
  const { compare, toggleCompare, clearCompare } = usePreferences()
  const [onlyDifferences, setOnlyDifferences] = useState(false)
  const [pendingId, setPendingId] = useState('')

  const selected = useMemo(() => compare.map((id) => vehicles.find((v) => v.id === id)).filter((v): v is Vehicle => Boolean(v)), [compare])
  const available = vehicles.filter((v) => !compare.includes(v.id))

  const best = (row: Row): number | null => {
    if (!row.better || selected.length < 2) return null
    const values = selected.map((v) => Number(row.get(v)))
    return row.better === 'high' ? Math.max(...values) : Math.min(...values)
  }

  return (
    <PageTransition>
      <div className={`container ${styles.page}`}>
        <header className={styles.header}>
          <div>
            <span className="t-eyebrow">Side by side</span>
            <h1 className="t-title">Compare vehicles</h1>
            <p className="t-description">Add up to {MAX_COMPARE} vehicles. The strongest value in each row is highlighted.</p>
          </div>
          {selected.length > 0 && (
            <div className={styles.headerActions}>
              <Toggle label="Only differences" checked={onlyDifferences} onChange={(e) => setOnlyDifferences(e.target.checked)} />
              <Button variant="ghost" size="sm" iconLeft="trash" onClick={clearCompare}>
                Clear
              </Button>
            </div>
          )}
        </header>

        {selected.length === 0 ? (
          <EmptyState
            icon="compare"
            title="Nothing to compare yet"
            description="Add vehicles from the discovery page or pick one below to start a comparison."
            action={
              <>
                <div className={styles.emptyPicker}>
                  <Select aria-label="Add a vehicle" options={[{ value: '', label: 'Choose a vehicle…' }, ...available.map((v) => ({ value: v.id, label: `${v.manufacturer} ${v.model}` }))]} value={pendingId} onChange={setPendingId} compact />
                  <Button disabled={!pendingId} onClick={() => { toggleCompare(pendingId); setPendingId('') }}>
                    Add
                  </Button>
                </div>
                <ButtonLink to="/cars" variant="ghost">
                  Browse cars
                </ButtonLink>
              </>
            }
          />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col" className={styles.labelCol}>
                    <span className="visually-hidden">Attribute</span>
                  </th>
                  {selected.map((v) => (
                    <th key={v.id} scope="col" className={styles.vehicleCol}>
                      <div className={styles.vehicleHead}>
                        <IconButton icon="x" label={`Remove ${v.model}`} size="sm" className={styles.remove} onClick={() => toggleCompare(v.id)} />
                        <div className={styles.vehicleVisual}>
                          <VehicleSilhouette profile={v.silhouette} color={v.colors[0].hex} />
                        </div>
                        <span className={styles.vehicleBrand}>{v.manufacturer}</span>
                        <span className={styles.vehicleModel}>{v.model}</span>
                        <span className={styles.vehicleVariant}>{v.variant}</span>
                        <ButtonLink to={`/cars/${v.id}`} variant="text" size="sm" iconRight="arrowRight">
                          Details
                        </ButtonLink>
                      </div>
                    </th>
                  ))}
                  {selected.length < MAX_COMPARE && (
                    <th scope="col" className={styles.vehicleCol}>
                      <div className={cx(styles.vehicleHead, styles.addHead)}>
                        <span className={styles.addIcon}>
                          <Icon name="plus" size={20} />
                        </span>
                        <span className={styles.addLabel}>Add a vehicle</span>
                        <Select aria-label="Add a vehicle" options={[{ value: '', label: 'Choose…' }, ...available.map((v) => ({ value: v.id, label: `${v.manufacturer} ${v.model}` }))]} value={pendingId} onChange={(id) => { if (id) { toggleCompare(id); setPendingId('') } }} compact />
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((group) => {
                  const rows = group.rows.filter((row) => !onlyDifferences || selected.length < 2 || new Set(selected.map((v) => row.get(v))).size > 1)
                  if (!rows.length) return null
                  return [
                    <tr key={`${group.group}-head`} className={styles.groupRow}>
                      <th scope="rowgroup" colSpan={selected.length + 2}>
                        {group.group}
                      </th>
                    </tr>,
                    ...rows.map((row) => {
                      const winner = best(row)
                      return (
                        <tr key={row.label}>
                          <th scope="row">{row.label}</th>
                          {selected.map((v) => {
                            const raw = row.get(v)
                            const isBest = winner !== null && Number(raw) === winner
                            return (
                              <td key={v.id} className={cx(isBest && styles.best)}>
                                {typeof raw === 'number' && row.format ? row.format(raw) : raw}
                                {isBest && <Icon name="check" size={13} className={styles.bestIcon} />}
                              </td>
                            )
                          })}
                          {selected.length < MAX_COMPARE && <td className={styles.placeholderCell} />}
                        </tr>
                      )
                    }),
                  ]
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
