import { BODY_TYPES, CATEGORIES, FUEL_TYPES, labelFor } from '@/data/categories'
import { vehicles } from '@/data/vehicles'
import type { Vehicle, VehicleCategory } from '@/models/vehicle'

export type Suggestion =
  | { kind: 'vehicle'; id: string; label: string; detail: string; vehicle: Vehicle }
  | { kind: 'category'; id: VehicleCategory; label: string; detail: string }
  | { kind: 'brand'; id: string; label: string; detail: string }
  | { kind: 'query'; id: string; label: string; detail: string }

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** Builds a searchable text blob for a vehicle once. */
const INDEX = vehicles.map((v) => ({
  vehicle: v,
  text: normalize(
    [
      v.manufacturer,
      v.model,
      v.variant,
      v.year,
      v.bodyType,
      labelFor(BODY_TYPES, v.bodyType),
      v.fuelType,
      labelFor(FUEL_TYPES, v.fuelType),
      v.transmission,
      v.category.join(' '),
      v.tagline,
      `${v.power} hp`,
      `${v.range} km`,
      `${v.seats} seats`,
    ].join(' '),
  ),
}))

export function searchVehicles(query: string): Vehicle[] {
  const q = normalize(query)
  if (!q) return vehicles
  const terms = q.split(' ')
  return INDEX.filter(({ text }) => terms.every((t) => text.includes(t))).map(({ vehicle }) => vehicle)
}

export function suggest(query: string, limit = 7): Suggestion[] {
  const q = normalize(query)
  if (!q) return []
  const out: Suggestion[] = []

  for (const cat of CATEGORIES) {
    if (cat.id !== 'all' && normalize(cat.label).startsWith(q)) {
      out.push({ kind: 'category', id: cat.id, label: cat.label, detail: 'Category' })
    }
  }
  const brands = Array.from(new Set(vehicles.map((v) => v.manufacturer)))
  for (const brand of brands) {
    if (normalize(brand).startsWith(q)) out.push({ kind: 'brand', id: brand, label: brand, detail: 'Manufacturer' })
  }
  for (const v of searchVehicles(query)) {
    out.push({
      kind: 'vehicle',
      id: v.id,
      label: `${v.manufacturer} ${v.model}`,
      detail: `${v.variant} · ${v.year}`,
      vehicle: v,
    })
  }
  return out.slice(0, limit)
}
