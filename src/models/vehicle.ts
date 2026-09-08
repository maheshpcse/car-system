export type BodyType = 'sedan' | 'suv' | 'coupe' | 'hatchback' | 'wagon' | 'roadster' | 'crossover' | 'pickup'
export type FuelType = 'electric' | 'hybrid' | 'petrol' | 'diesel'
export type Transmission = 'automatic' | 'manual' | 'single-speed' | 'dual-clutch'
export type VehicleCategory = 'all' | 'electric' | 'performance' | 'luxury' | 'family' | 'adventure' | 'compact'

export interface VehicleColor {
  id: string
  name: string
  hex: string
  finish: 'solid' | 'metallic' | 'pearl' | 'matte'
  price: number
}

export interface WheelOption {
  id: string
  name: string
  sizeInches: number
  style: 'aero' | 'sport' | 'classic' | 'forged'
  price: number
}

export interface InteriorOption {
  id: string
  name: string
  accent: string
  material: 'fabric' | 'leather' | 'vegan-leather' | 'alcantara'
  price: number
}

export interface TrimOption {
  id: string
  name: string
  description: string
  price: number
}

export interface AccessoryOption {
  id: string
  name: string
  description: string
  price: number
}

export interface VehicleVariant {
  id: string
  name: string
  price: number
  power: number
  range: number
  acceleration: number
}

export interface VehicleDimensions {
  lengthMm: number
  widthMm: number
  heightMm: number
  wheelbaseMm: number
  cargoLiters: number
  weightKg: number
}

export interface Vehicle {
  id: string
  manufacturer: string
  model: string
  variant: string
  year: number
  tagline: string
  description: string
  category: Exclude<VehicleCategory, 'all'>[]
  bodyType: BodyType
  fuelType: FuelType
  transmission: Transmission
  /** kW for EVs, hp equivalent stored as `power` for simplicity (hp). */
  power: number
  /** Nm */
  torque: number
  /** km/h */
  topSpeed: number
  /** seconds 0–100 km/h */
  acceleration: number
  /** km (EV/hybrid range) */
  range: number
  /** km per liter, for combustion engines; null for EVs */
  mileage: number | null
  seats: number
  /** Starting price in USD */
  price: number
  rating: number
  isNew?: boolean
  isFeatured?: boolean
  colors: VehicleColor[]
  wheels: WheelOption[]
  interiors: InteriorOption[]
  trims: TrimOption[]
  accessories: AccessoryOption[]
  variants: VehicleVariant[]
  dimensions: VehicleDimensions
  features: string[]
  technology: string[]
  safety: string[]
  /** Path to a GLB/GLTF model when available; null falls back to the procedural model. */
  model3d: string | null
  /** Procedural model silhouette profile used when model3d is null. */
  silhouette: 'sedan' | 'suv' | 'coupe' | 'hatch' | 'wagon' | 'roadster' | 'pickup'
}

export interface VehicleFilters {
  category: VehicleCategory
  query: string
  brands: string[]
  bodyTypes: BodyType[]
  fuelTypes: FuelType[]
  transmissions: Transmission[]
  priceRange: [number, number]
  minYear: number
  minRange: number
  minPower: number
  minSeats: number
}

export type SortKey =
  | 'recommended'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'performance'
  | 'range'
  | 'alphabetical'

export type ViewMode = 'grid' | 'list'

export interface SavedBuild {
  id: string
  vehicleId: string
  name: string
  createdAt: string
  colorId: string
  wheelId: string
  interiorId: string
  trimId: string
  accessoryIds: string[]
  total: number
}
