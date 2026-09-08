import { useEffect, useMemo, useState } from 'react'
import { PRICE_BOUNDS, vehicles } from '@/data/vehicles'
import { searchVehicles } from '@/features/search/searchService'
import type { SortKey, Vehicle, VehicleFilters } from '@/models/vehicle'

export const DEFAULT_FILTERS: VehicleFilters = {
  category: 'all',
  query: '',
  brands: [],
  bodyTypes: [],
  fuelTypes: [],
  transmissions: [],
  priceRange: PRICE_BOUNDS,
  minYear: 2020,
  minRange: 0,
  minPower: 0,
  minSeats: 0,
}

export function countActiveFilters(f: VehicleFilters) {
  let n = 0
  if (f.brands.length) n++
  if (f.bodyTypes.length) n++
  if (f.fuelTypes.length) n++
  if (f.transmissions.length) n++
  if (f.priceRange[0] !== PRICE_BOUNDS[0] || f.priceRange[1] !== PRICE_BOUNDS[1]) n++
  if (f.minYear > DEFAULT_FILTERS.minYear) n++
  if (f.minRange > 0) n++
  if (f.minPower > 0) n++
  if (f.minSeats > 0) n++
  return n
}

export function applyFilters(list: Vehicle[], f: VehicleFilters): Vehicle[] {
  return list.filter((v) => {
    if (f.category !== 'all' && !v.category.includes(f.category)) return false
    if (f.brands.length && !f.brands.includes(v.manufacturer)) return false
    if (f.bodyTypes.length && !f.bodyTypes.includes(v.bodyType)) return false
    if (f.fuelTypes.length && !f.fuelTypes.includes(v.fuelType)) return false
    if (f.transmissions.length && !f.transmissions.includes(v.transmission)) return false
    if (v.price < f.priceRange[0] || v.price > f.priceRange[1]) return false
    if (v.year < f.minYear) return false
    if (v.range < f.minRange) return false
    if (v.power < f.minPower) return false
    if (v.seats < f.minSeats) return false
    return true
  })
}

export function sortVehicles(list: Vehicle[], sort: SortKey): Vehicle[] {
  const copy = list.slice()
  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => b.year - a.year || b.rating - a.rating)
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price)
    case 'performance':
      return copy.sort((a, b) => a.acceleration - b.acceleration || b.power - a.power)
    case 'range':
      return copy.sort((a, b) => b.range - a.range)
    case 'alphabetical':
      return copy.sort((a, b) => `${a.manufacturer} ${a.model}`.localeCompare(`${b.manufacturer} ${b.model}`))
    case 'recommended':
    default:
      return copy.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) || b.rating - a.rating)
  }
}

/** Runs the search/filter/sort pipeline with a short simulated latency for loading feedback. */
export function useVehicleQuery(filters: VehicleFilters, sort: SortKey) {
  const results = useMemo(() => sortVehicles(applyFilters(searchVehicles(filters.query), filters), sort), [filters, sort])
  const [loading, setLoading] = useState(false)
  const [shown, setShown] = useState(results)

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setShown(results)
      setLoading(false)
    }, 220)
    return () => window.clearTimeout(t)
  }, [results])

  return { results: shown, loading, total: vehicles.length }
}
