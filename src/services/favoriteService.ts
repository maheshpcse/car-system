import type { Vehicle } from '@/models/vehicle'
import { apiClient } from './apiClient'

export const favoriteService = {
  async list() {
    const result = await apiClient.request<Array<{ vehicleId: string; vehicle: Vehicle }>>('/favorites')
    return result.data
  },
  async add(vehicleId: string) {
    await apiClient.request(`/favorites/${encodeURIComponent(vehicleId)}`, { method: 'POST' })
  },
  async remove(vehicleId: string) {
    await apiClient.request(`/favorites/${encodeURIComponent(vehicleId)}`, { method: 'DELETE' })
  },
}
