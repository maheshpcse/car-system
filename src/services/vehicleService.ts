import { PRICE_BOUNDS, getVehicleById, vehicles } from '@/data/vehicles'
import { applyFilters, sortVehicles } from '@/features/cars/vehiclePipeline'
import { searchVehicles } from '@/features/search/searchService'
import type { SortKey, Vehicle, VehicleFilters } from '@/models/vehicle'
import { apiClient } from './apiClient'

export interface VehicleListResult {
  items: Vehicle[]
  total: number
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const localSearch = (filters: VehicleFilters, sort: SortKey, page = 1, limit = 12): VehicleListResult => {
  const items = sortVehicles(applyFilters(searchVehicles(filters.query), filters), sort)
  const start = (page - 1) * limit
  return {
    items: items.slice(start, start + limit),
    total: items.length,
    pagination: { page, limit, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / limit)) },
  }
}

export const vehicleService = {
  async list(filters: VehicleFilters, sort: SortKey, page = 1, limit = 12): Promise<VehicleListResult> {
    if (!apiClient.enabled) return { ...localSearch(filters, sort, page, limit), total: vehicles.length }

    try {
      const params = new URLSearchParams()
      if (filters.query) params.set('search', filters.query)
      if (filters.category !== 'all') params.set('category', filters.category)
      filters.brands.forEach((brand) => params.append('brands', brand))
      filters.bodyTypes.forEach((type) => params.append('bodyTypes', type))
      filters.fuelTypes.forEach((type) => params.append('fuelTypes', type))
      filters.transmissions.forEach((type) => params.append('transmissions', type))
      if (filters.priceRange[0] !== PRICE_BOUNDS[0]) params.set('minPrice', String(filters.priceRange[0]))
      if (filters.priceRange[1] !== PRICE_BOUNDS[1]) params.set('maxPrice', String(filters.priceRange[1]))
      if (filters.minYear > 2020) params.set('minYear', String(filters.minYear))
      if (filters.minRange) params.set('minRange', String(filters.minRange))
      if (filters.minPower) params.set('minPower', String(filters.minPower))
      if (filters.minSeats) params.set('minSeats', String(filters.minSeats))
      params.set('sort', sort)
      params.set('page', String(page))
      params.set('limit', String(limit))
      const result = await apiClient.request<Vehicle[]>(`/vehicles?${params.toString()}`)
      return {
        items: result.data,
        total: result.pagination?.total ?? result.data.length,
        pagination: result.pagination,
      }
    } catch {
      return { ...localSearch(filters, sort, page, limit), total: vehicles.length }
    }
  },

  async getById(id: string | undefined): Promise<Vehicle | undefined> {
    const local = getVehicleById(id)
    if (!id || !apiClient.enabled) return local
    try {
      const result = await apiClient.request<Vehicle>(`/vehicles/${encodeURIComponent(id)}`)
      return result.data
    } catch {
      return local
    }
  },
}
