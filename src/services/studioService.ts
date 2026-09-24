import { BROCHURES, DEALERSHIPS, MARKETPLACE_SEED, PROMOTIONS, type Brochure, type Dealership, type MarketplaceListing } from '@/data/studio'
import type { AppNotification } from '@/models/notification'
import { apiClient } from './apiClient'

export type SellListingInput = {
  title: string
  year: number
  askingPrice: number
  odometerKm: number
  condition: string
  city: string
  notes: string
  contactName: string
  email: string
  phone?: string
  vehicleId?: string
}

let localListings = MARKETPLACE_SEED.map((item) => ({ ...item }))

export const studioService = {
  async promotions(): Promise<AppNotification[]> {
    return PROMOTIONS.map((item) => ({ ...item }))
  },

  async dealerships(): Promise<Dealership[]> {
    if (apiClient.enabled) {
      try {
        const result = await apiClient.request<Dealership[]>('/studio/dealerships')
        return result.data
      } catch {
        /* local */
      }
    }
    return DEALERSHIPS
  },

  async brochures(): Promise<Brochure[]> {
    if (apiClient.enabled) {
      try {
        const result = await apiClient.request<Brochure[]>('/studio/brochures')
        return result.data
      } catch {
        /* local */
      }
    }
    return BROCHURES
  },

  async brochure(id: string): Promise<Brochure | undefined> {
    if (apiClient.enabled) {
      try {
        const result = await apiClient.request<Brochure>(`/studio/brochures/${encodeURIComponent(id)}`)
        return result.data
      } catch {
        /* local */
      }
    }
    return BROCHURES.find((item) => item.id === id || item.slug === id)
  },

  async marketplace(): Promise<MarketplaceListing[]> {
    if (apiClient.enabled) {
      try {
        const result = await apiClient.request<MarketplaceListing[]>('/studio/marketplace/listings')
        return result.data
      } catch {
        /* local */
      }
    }
    return localListings.map((item) => ({ ...item }))
  },

  async sell(input: SellListingInput): Promise<MarketplaceListing> {
    if (apiClient.enabled) {
      try {
        const result = await apiClient.request<MarketplaceListing>('/studio/marketplace/listings', {
          method: 'POST',
          body: JSON.stringify(input),
        })
        return result.data
      } catch {
        /* local */
      }
    }
    const created: MarketplaceListing = {
      id: `ml-local-${Date.now()}`,
      title: input.title,
      year: input.year,
      askingPrice: input.askingPrice,
      odometerKm: input.odometerKm,
      condition: input.condition,
      city: input.city,
      notes: input.notes,
      contactName: input.contactName,
      vehicleId: input.vehicleId,
      createdAt: new Date().toISOString(),
    }
    localListings = [created, ...localListings]
    return created
  },
}
