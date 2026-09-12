import type { SavedBuild } from '@/models/vehicle'
import { apiClient } from './apiClient'

export interface PriceQuote {
  basePrice: number
  optionPrice: number
  totalPrice: number
  currency: string
}

export const configurationService = {
  async quote(input: Omit<SavedBuild, 'id' | 'name' | 'createdAt' | 'totalPrice'> & { vehicleId: string }) {
    const created = await apiClient.request<{
      basePrice: number
      optionPrice: number
      totalPrice: number
      currency: string
    }>('/configurations', {
      method: 'POST',
      body: JSON.stringify({
        vehicleId: input.vehicleId,
        variantId: input.variantId,
        colorId: input.colorId,
        wheelId: input.wheelId,
        interiorId: input.interiorId,
        trimId: input.trimId,
        accessoryIds: input.accessoryIds,
      }),
    })
    return created.data
  },

  async saveBuild(build: Omit<SavedBuild, 'id' | 'createdAt'>) {
    const result = await apiClient.request<SavedBuild>('/saved-builds', {
      method: 'POST',
      body: JSON.stringify(build),
    })
    return result.data
  },
}
