import type { IconName } from '@/shared/icons/Icon'
import type { BodyType, FuelType, SortKey, Transmission, VehicleCategory } from '@/models/vehicle'

export interface CategoryMeta {
  id: VehicleCategory
  label: string
  description: string
  icon: IconName
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'all', label: 'All Vehicles', description: 'The complete Aurora line-up', icon: 'car' },
  { id: 'electric', label: 'Electric', description: 'Zero-emission drivetrains', icon: 'charging' },
  { id: 'performance', label: 'Performance', description: 'Built for the driver', icon: 'speed' },
  { id: 'luxury', label: 'Luxury', description: 'First-class comfort', icon: 'sparkle' },
  { id: 'family', label: 'Family', description: 'Space, safety and range', icon: 'users' },
  { id: 'adventure', label: 'Adventure', description: 'Capability beyond the tarmac', icon: 'layers' },
  { id: 'compact', label: 'Compact', description: 'Efficient city companions', icon: 'cube' },
]

export const BODY_TYPES: { id: BodyType; label: string }[] = [
  { id: 'sedan', label: 'Sedan' },
  { id: 'suv', label: 'SUV' },
  { id: 'crossover', label: 'Crossover' },
  { id: 'coupe', label: 'Coupé' },
  { id: 'hatchback', label: 'Hatchback' },
  { id: 'wagon', label: 'Estate' },
  { id: 'roadster', label: 'Roadster' },
  { id: 'pickup', label: 'Pickup' },
]

export const FUEL_TYPES: { id: FuelType; label: string }[] = [
  { id: 'electric', label: 'Electric' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'petrol', label: 'Petrol' },
  { id: 'diesel', label: 'Diesel' },
]

export const TRANSMISSIONS: { id: Transmission; label: string }[] = [
  { id: 'automatic', label: 'Automatic' },
  { id: 'dual-clutch', label: 'Dual-clutch' },
  { id: 'single-speed', label: 'Single-speed' },
  { id: 'manual', label: 'Manual' },
]

export const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc', label: 'Price: High → Low' },
  { id: 'performance', label: 'Performance' },
  { id: 'range', label: 'Range' },
  { id: 'alphabetical', label: 'Alphabetical' },
]

export const labelFor = <T extends string>(list: { id: T; label: string }[], id: T) =>
  list.find((item) => item.id === id)?.label ?? id
