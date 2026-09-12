import { useEffect, useState } from 'react'
import { vehicles } from '@/data/vehicles'
import type { SortKey, Vehicle, VehicleFilters } from '@/models/vehicle'
import { apiClient } from '@/services/apiClient'
import { vehicleService } from '@/services/vehicleService'
import { applyFilters, countActiveFilters, DEFAULT_FILTERS, sortVehicles } from './vehiclePipeline'

export { applyFilters, countActiveFilters, DEFAULT_FILTERS, sortVehicles }

/** Search/filter/sort. Uses the API when VITE_API_BASE_URL is set, otherwise local mock data. */
export function useVehicleQuery(filters: VehicleFilters, sort: SortKey) {
  const [results, setResults] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(vehicles.length)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const run = async () => {
      const page = await vehicleService.list(filters, sort, 1, 100)
      if (cancelled) return
      setResults(page.items)
      setTotal(apiClient.enabled ? page.total : vehicles.length)
      setLoading(false)
    }
    const timer = window.setTimeout(() => {
      void run()
    }, apiClient.enabled ? 0 : 220)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [filters, sort])

  return { results, loading, total }
}
