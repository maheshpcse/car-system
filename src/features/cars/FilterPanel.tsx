import { useIsMobile } from '@/core/hooks/useMediaQuery'
import { formatPriceCompact } from '@/core/utils/format'
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS } from '@/data/categories'
import { BRANDS, PRICE_BOUNDS } from '@/data/vehicles'
import type { VehicleFilters } from '@/models/vehicle'
import { Button } from '@/shared/ui/Button'
import { Checkbox, Slider } from '@/shared/ui/Field'
import { Sheet } from '@/shared/ui/Sheet'
import { DEFAULT_FILTERS } from './useVehicleQuery'
import styles from './FilterPanel.module.scss'

interface FilterPanelProps {
  open: boolean
  onClose: () => void
  filters: VehicleFilters
  onChange: (next: VehicleFilters) => void
  resultCount: number
}

function toggleIn<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
}

export function FilterPanel({ open, onClose, filters, onChange, resultCount }: FilterPanelProps) {
  const isMobile = useIsMobile()
  const set = <K extends keyof VehicleFilters>(key: K, value: VehicleFilters[K]) => onChange({ ...filters, [key]: value })

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filters"
      placement={isMobile ? 'bottom' : 'side'}
      width={380}
      footer={
        <>
          <Button variant="ghost" onClick={() => onChange({ ...DEFAULT_FILTERS, category: filters.category, query: filters.query })}>
            Reset
          </Button>
          <Button onClick={onClose}>Show {resultCount} vehicles</Button>
        </>
      }
    >
      <div className={styles.groups}>
        <fieldset className={styles.group}>
          <legend>Brand</legend>
          <div className={styles.checks}>
            {BRANDS.map((b) => (
              <Checkbox key={b} label={b} checked={filters.brands.includes(b)} onChange={() => set('brands', toggleIn(filters.brands, b))} />
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Body type</legend>
          <div className={styles.chips}>
            {BODY_TYPES.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`${styles.chip} ${filters.bodyTypes.includes(b.id) ? styles.chipActive : ''}`}
                aria-pressed={filters.bodyTypes.includes(b.id)}
                onClick={() => set('bodyTypes', toggleIn(filters.bodyTypes, b.id))}
              >
                {b.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Fuel type</legend>
          <div className={styles.chips}>
            {FUEL_TYPES.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`${styles.chip} ${filters.fuelTypes.includes(f.id) ? styles.chipActive : ''}`}
                aria-pressed={filters.fuelTypes.includes(f.id)}
                onClick={() => set('fuelTypes', toggleIn(filters.fuelTypes, f.id))}
              >
                {f.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Transmission</legend>
          <div className={styles.checks}>
            {TRANSMISSIONS.map((t) => (
              <Checkbox key={t.id} label={t.label} checked={filters.transmissions.includes(t.id)} onChange={() => set('transmissions', toggleIn(filters.transmissions, t.id))} />
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend>Price & performance</legend>
          <Slider
            label="Max price"
            min={PRICE_BOUNDS[0]}
            max={PRICE_BOUNDS[1]}
            step={1000}
            value={filters.priceRange[1]}
            onChange={(v) => set('priceRange', [PRICE_BOUNDS[0], v])}
            format={formatPriceCompact}
          />
          <Slider label="Min year" min={2020} max={2026} step={1} value={filters.minYear} onChange={(v) => set('minYear', v)} />
          <Slider label="Min range" min={0} max={1000} step={50} value={filters.minRange} onChange={(v) => set('minRange', v)} format={(v) => `${v} km`} />
          <Slider label="Min power" min={0} max={800} step={25} value={filters.minPower} onChange={(v) => set('minPower', v)} format={(v) => `${v} hp`} />
          <Slider label="Min seats" min={0} max={7} step={1} value={filters.minSeats} onChange={(v) => set('minSeats', v)} format={(v) => (v === 0 ? 'Any' : String(v))} />
        </fieldset>
      </div>
    </Sheet>
  )
}
