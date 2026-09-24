import type { AppNotification } from '@/models/notification'
import type { Vehicle } from '@/models/vehicle'
import { vehicles as catalog } from './vehicles'

export interface Dealership {
  id: string
  slug: string
  name: string
  city: string
  region: string
  address: string
  latitude: number
  longitude: number
  mapX: number
  mapY: number
  phone: string
  hours: string
  services: string[]
}

export interface BrochureSection {
  id: string
  title: string
  body: string
  highlights?: string[]
  variants?: { name: string; price: number; power?: number; range?: number }[]
}

export interface Brochure {
  id: string
  slug: string
  vehicleId?: string | null
  title: string
  subtitle: string
  heroHex: string
  sections: BrochureSection[]
}

export interface MarketplaceListing {
  id: string
  title: string
  year: number
  askingPrice: number
  currency?: string
  odometerKm: number
  condition: string
  city: string
  notes: string
  contactName: string
  vehicleId?: string | null
  createdAt: string
}

function fromCatalog(id: string, patch: Partial<Vehicle> & { id: string }): Vehicle {
  const base = catalog.find((vehicle) => vehicle.id === id)
  if (!base) throw new Error(`Unknown vehicle ${id}`)
  const price = patch.price ?? base.price
  return {
    ...base,
    ...patch,
    price,
    exShowroomPrice: patch.exShowroomPrice ?? price,
    onRoadPrice: patch.onRoadPrice ?? Math.round(price * 1.12),
    isFeatured: patch.isFeatured ?? false,
  }
}

export const EXTRA_VEHICLES: Vehicle[] = [
  fromCatalog('aureon-x1', {
    id: 'used-aureon-x1',
    listingKind: 'USED',
    year: 2023,
    variant: 'Certified Long Range',
    tagline: 'A studio favourite, already broken in.',
    description: 'One-owner Aurora Sutra with a full service history, ceramic coating and remaining dual-motor warranty.',
    price: 3899000,
    odometerKm: 28400,
    previousOwners: 1,
    condition: 'Certified pre-owned',
    certified: true,
    isNew: false,
    rating: 4.6,
  }),
  fromCatalog('velora-gt', {
    id: 'used-velora-gt',
    listingKind: 'USED',
    year: 2022,
    variant: 'Grand Tourer',
    tagline: 'Weekend miles, weekday poise.',
    description: 'A low-mileage Deccan GT with forged wheels, studio sound and a recently replaced set of performance tyres.',
    price: 14900000,
    odometerKm: 19250,
    previousOwners: 2,
    condition: 'Excellent',
    certified: true,
    isNew: false,
    rating: 4.5,
  }),
  fromCatalog('rivana-xr', {
    id: 'used-rivana-xr',
    listingKind: 'USED',
    year: 2021,
    variant: 'Adventure',
    tagline: 'Ready for the next trail.',
    description: 'Roof rails, all-weather mats and a documented off-road service at 18,000 km.',
    price: 3299000,
    odometerKm: 41200,
    previousOwners: 1,
    condition: 'Very good',
    certified: false,
    isNew: false,
    rating: 4.4,
  }),
  fromCatalog('orion-touring', {
    id: 'used-orion-touring',
    listingKind: 'USED',
    year: 2020,
    variant: 'Family Plus',
    tagline: 'Space for everyone, already lived-in.',
    description: 'Seven-seat Himalayan Touring with a clean interior, tow package and recent brake service.',
    price: 2599000,
    odometerKm: 67800,
    previousOwners: 2,
    condition: 'Good',
    certified: false,
    isNew: false,
    rating: 4.3,
  }),
  fromCatalog('kairo-s', {
    id: 'used-kairo-s',
    listingKind: 'USED',
    year: 2024,
    variant: 'Sport',
    tagline: 'Nearly new, meaningfully less.',
    description: 'Dealer demonstrator Malabar S with remaining factory warranty and a single registered owner.',
    price: 1099000,
    odometerKm: 6400,
    previousOwners: 1,
    condition: 'Like new',
    certified: true,
    isNew: false,
    rating: 4.7,
  }),
  fromCatalog('nexen-city', {
    id: 'used-nexen-city',
    listingKind: 'USED',
    year: 2023,
    variant: 'City',
    tagline: 'A compact commute, already paid the depreciation.',
    description: 'Urban Konkan Galli with a home charger included and a documented battery health report.',
    price: 599000,
    odometerKm: 22100,
    previousOwners: 1,
    condition: 'Very good',
    certified: true,
    isNew: false,
    rating: 4.2,
  }),
  fromCatalog('aureon-v9', {
    id: 'upcoming-aureon-s',
    listingKind: 'UPCOMING',
    model: 'S',
    year: 2027,
    variant: 'Prototype Preview',
    tagline: 'The next Aureon sedan, still under wraps.',
    description: 'A lower, longer successor to the X1 with an 800-volt pack and a cabin built around a single glass canopy.',
    price: 6299000,
    expectedLaunch: 'Spring 2027',
    isNew: true,
    isFeatured: true,
    rating: 4.9,
  }),
  fromCatalog('ventra-rs', {
    id: 'upcoming-ventra-gt',
    listingKind: 'UPCOMING',
    model: 'GT',
    year: 2027,
    variant: 'Track Preview',
    tagline: 'More power, less apology.',
    description: 'Ventra’s next halo coupe — active aero, a four-motor layout and a promised 2.3 s sprint.',
    price: 14800000,
    expectedLaunch: 'Autumn 2027',
    isNew: true,
    rating: 4.8,
  }),
  fromCatalog('solace-ev', {
    id: 'upcoming-solace-air',
    listingKind: 'UPCOMING',
    model: 'Air',
    year: 2028,
    variant: 'Concept',
    tagline: 'Range that treats a continent as a commute.',
    description: 'A three-row electric touring concept aiming for 900 km and a 12-minute 10–80 charge.',
    price: 6799000,
    expectedLaunch: 'Winter 2027–28',
    isNew: true,
    rating: 4.7,
  }),
  fromCatalog('velora-gt', {
    id: 'vintage-velora-berlinetta',
    listingKind: 'VINTAGE',
    model: 'Berlinetta',
    year: 1974,
    heritageYear: 1974,
    variant: 'Series II',
    tagline: 'Coachbuilt aluminium, analog drama.',
    description: 'A matching-numbers Deccan Berlinetta with a recent mechanical restoration and its original tool roll.',
    price: 14800000,
    odometerKm: 41200,
    previousOwners: 3,
    condition: 'Concours',
    certified: true,
    isNew: false,
    rating: 4.9,
  }),
  fromCatalog('aureon-x1', {
    id: 'vintage-aureon-coupe',
    listingKind: 'VINTAGE',
    model: 'Coupe',
    year: 1968,
    heritageYear: 1968,
    variant: 'Grand Luxe',
    tagline: 'The first Aureon that felt like a lounge.',
    description: 'Hand-finished wood, a straight-six and a cabin that still smells faintly of tobacco and hide.',
    price: 7600000,
    odometerKm: 62800,
    previousOwners: 4,
    condition: 'Restored',
    certified: true,
    fuelType: 'petrol',
    transmission: 'manual',
    isNew: false,
    rating: 4.8,
  }),
  fromCatalog('velora-estate', {
    id: 'vintage-nimbus-estate',
    listingKind: 'VINTAGE',
    manufacturer: 'Nimbus',
    model: 'Estate',
    year: 1982,
    heritageYear: 1982,
    variant: 'Touring',
    tagline: 'Wood, chrome and room for a picnic.',
    description: 'A shooting-brake Nimbus with a documented concours history and a rebuilt carburettor.',
    price: 3299000,
    odometerKm: 89400,
    previousOwners: 5,
    condition: 'Very good',
    certified: false,
    fuelType: 'petrol',
    transmission: 'manual',
    isNew: false,
    rating: 4.5,
  }),
  fromCatalog('kairo-cross', {
    id: 'vintage-helix-rally',
    listingKind: 'VINTAGE',
    manufacturer: 'Helix',
    model: 'Rally',
    year: 1971,
    heritageYear: 1971,
    variant: 'Group 2',
    tagline: 'Homologation special, still eager.',
    description: 'A period-correct Helix Rally with a roll cage, period maps and a rebuilt five-speed.',
    price: 9800000,
    odometerKm: 22100,
    previousOwners: 2,
    condition: 'Race prepared',
    certified: true,
    fuelType: 'petrol',
    transmission: 'manual',
    isNew: false,
    rating: 4.9,
  }),
]

export const allVehicles: Vehicle[] = [
  ...catalog.map((vehicle) => ({
    ...vehicle,
    listingKind: vehicle.listingKind ?? 'NEW',
    exShowroomPrice: vehicle.exShowroomPrice ?? vehicle.price,
    onRoadPrice: vehicle.onRoadPrice ?? Math.round(vehicle.price * 1.12),
  })),
  ...EXTRA_VEHICLES,
]

export const DEALERSHIPS: Dealership[] = [
  { id: 'dl-harbour', slug: 'bkc-line', name: 'Aurora Line BKC', city: 'Mumbai', region: 'Maharashtra', address: 'One BKC, G Block, Bandra Kurla Complex, Bandra East, Mumbai 400051', latitude: 19.0669, longitude: 72.8697, mapX: 22, mapY: 38, phone: '+91 22 6240 1800', hours: 'Mon–Sat 10:00–20:00', services: ['New', 'Used', 'Configurator', 'Service'] },
  { id: 'dl-ridge', slug: 'aerocity-line', name: 'Aurora Aerocity', city: 'New Delhi', region: 'Delhi', address: 'Worldmark 1, Aerocity, New Delhi 110037', latitude: 28.5504, longitude: 77.122, mapX: 48, mapY: 18, phone: '+91 11 4119 0104', hours: 'Tue–Sun 10:00–20:00', services: ['Vintage', 'Restoration', 'Test drive'] },
  { id: 'dl-plaza', slug: 'whitefield-house', name: 'Aurora Whitefield', city: 'Bengaluru', region: 'Karnataka', address: 'Prestige Shantiniketan, ITPL Main Road, Whitefield, Bengaluru 560048', latitude: 12.9922, longitude: 77.7289, mapX: 58, mapY: 42, phone: '+91 80 4680 5300', hours: 'Daily 10:00–21:00', services: ['New', 'Upcoming previews', 'Brochures'] },
  { id: 'dl-orchard', slug: 'hitec-yard', name: 'Aurora HITEC', city: 'Hyderabad', region: 'Telangana', address: 'Raheja Mindspace, HITEC City, Hyderabad 500081', latitude: 17.4435, longitude: 78.3772, mapX: 36, mapY: 62, phone: '+91 40 4030 0909', hours: 'Mon–Sat 10:00–20:00', services: ['Used', 'Marketplace intake', 'Service'] },
  { id: 'dl-lakes', slug: 'cathedral-line', name: 'Aurora Cathedral', city: 'Chennai', region: 'Tamil Nadu', address: '10 Cathedral Road, Gopalapuram, Chennai 600086', latitude: 13.0475, longitude: 80.2588, mapX: 18, mapY: 72, phone: '+91 44 4592 0101', hours: 'Wed–Sun 10:00–19:00', services: ['New', 'Family test drives'] },
  { id: 'dl-dune', slug: 'baner-outpost', name: 'Aurora Baner', city: 'Pune', region: 'Maharashtra', address: 'ICC Trade Tower, Senapati Bapat Road, Pune 411016', latitude: 18.5308, longitude: 73.829, mapX: 78, mapY: 68, phone: '+91 20 6764 4400', hours: 'Thu–Mon 11:00–20:00', services: ['Adventure', 'Used', 'Charging'] },
  { id: 'dl-harbour-east', slug: 'sg-highway', name: 'Aurora SG Highway', city: 'Ahmedabad', region: 'Gujarat', address: 'Iscon Centre, SG Highway, Ahmedabad 380015', latitude: 23.0276, longitude: 72.508, mapX: 82, mapY: 28, phone: '+91 79 4890 4400', hours: 'Mon–Sat 10:00–20:00', services: ['New', 'Electric', 'Home charger'] },
  { id: 'dl-archive', slug: 'camac-archive', name: 'Aurora Camac Archive', city: 'Kolkata', region: 'West Bengal', address: '22 Camac Street, Elgin, Kolkata 700016', latitude: 22.5448, longitude: 88.3516, mapX: 64, mapY: 80, phone: '+91 33 4007 6600', hours: 'Fri–Sun 11:00–18:00', services: ['Vintage', 'Selling', 'Authentication'] },
]

export const BROCHURES: Brochure[] = [
  {
    id: 'br-aureon-x1',
    slug: 'aureon-x1',
    vehicleId: 'aureon-x1',
    title: 'Aurora Sutra',
    subtitle: 'Quiet power for long horizons — every variant, finish and cabin.',
    heroHex: '#1C1A8A',
    sections: [
      { id: 'cover', title: 'The line', body: 'Three variants share a dual-motor architecture and a cabin designed for long days.', highlights: ['Long Range AWD', 'Standard Range', 'Performance'] },
      { id: 'mechanical', title: 'Mechanical', body: '800-volt architecture, silicon-carbide inverters and adaptive air suspension.', highlights: ['536 hp', '780 Nm', '3.4 s', '610 km'] },
      {
        id: 'variants',
        title: 'Variant pages',
        body: 'Each variant is specified independently so the brochure stays accurate as options change.',
        variants: [
          { name: 'Standard Range', price: 4699000, power: 402, range: 480 },
          { name: 'Long Range AWD', price: 5499000, power: 536, range: 610 },
          { name: 'Performance', price: 6499000, power: 690, range: 560 },
        ],
      },
      { id: 'studio', title: 'In the studio', body: 'Open the 3D showroom or take a drive-mode lap around the illustrated road.' },
    ],
  },
  {
    id: 'br-velora-gt',
    slug: 'velora-gt',
    vehicleId: 'velora-gt',
    title: 'Deccan GT',
    subtitle: 'Grand touring written as a colour story.',
    heroHex: '#8D1418',
    sections: [
      { id: 'cover', title: 'Grand tourer', body: 'A long-bonnet coupe with a cabin that prefers leather and late arrivals.', highlights: ['Coupe', 'Performance', 'Luxury'] },
      { id: 'mechanical', title: 'Mechanical', body: 'Dual-clutch, torque vectoring and forged wheels as a factory conversation.', highlights: ['Chassis', 'Powertrain', 'Brakes'] },
      { id: 'variants', title: 'Finishes', body: 'Deep Crimson, Graphite and Studio Ivory — each with its own interior pairing.' },
    ],
  },
  {
    id: 'br-heritage',
    slug: 'heritage-collection',
    vehicleId: 'vintage-velora-berlinetta',
    title: 'Heritage Collection',
    subtitle: 'Four cars that explain why the studio still keeps a workshop.',
    heroHex: '#4A5057',
    sections: [
      { id: 'cover', title: 'Archive', body: 'Berlinetta, Coupe, Estate and Rally — authenticated, photographed, and ready to sell.', highlights: ['1974 Berlinetta', '1968 Coupe', '1982 Estate', '1971 Rally'] },
      { id: 'selling', title: 'Selling with the Archive', body: 'Consign a vintage car through the marketplace desk. The studio handles photography, provenance and buyer introductions.' },
    ],
  },
]

export const PROMOTIONS: AppNotification[] = [
  { id: 'promo-spring-drive', title: 'Spring drive weekend', detail: 'Complimentary 3D drive sessions at Aurora Line BKC this Saturday.', createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), read: false, href: '/locations', kind: 'offer', audience: 'PUBLIC', offer: { label: 'Book a bay', cta: '/showroom?mode=drive' } },
  { id: 'promo-used-cert', title: 'Certified used, studio inspected', detail: 'Every certified listing includes a 120-point check and remaining manufacturer warranty.', createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(), read: false, href: '/used-cars', kind: 'offer', audience: 'PUBLIC', offer: { label: 'Browse used', cta: '/used-cars' } },
  { id: 'promo-upcoming', title: 'Aurora Sutra S preview nights', detail: 'Reserve a place for the first public walkaround of the 2027 Aurora Sutra S.', createdAt: new Date(Date.now() - 800 * 60 * 1000).toISOString(), read: false, href: '/upcoming', kind: 'vehicle', audience: 'PUBLIC' },
  { id: 'promo-brochure', title: 'New digital brochures', detail: 'Large-format brochures now include every variant, finish and mechanical diagram.', createdAt: new Date(Date.now() - 1400 * 60 * 1000).toISOString(), read: false, href: '/brochures', kind: 'info', audience: 'PUBLIC' },
  { id: 'promo-vintage', title: 'Heritage week at the Archive', detail: 'Four restored cars on the floor — and a private selling desk for consignments.', createdAt: new Date(Date.now() - 2100 * 60 * 1000).toISOString(), read: false, href: '/vintage', kind: 'offer', audience: 'PUBLIC' },
  { id: 'promo-onroad', title: 'On-road prices, shown plainly', detail: 'Ex-showroom and on-road figures are now listed on every new vehicle page.', createdAt: new Date(Date.now() - 3200 * 60 * 1000).toISOString(), read: true, href: '/cars', kind: 'info', audience: 'PUBLIC' },
]

export const MARKETPLACE_SEED: MarketplaceListing[] = [
  { id: 'ml-1', title: '1974 Deccan Berlinetta', year: 1974, askingPrice: 14200000, odometerKm: 41200, condition: 'Concours', city: 'Kolkata', notes: 'Matching numbers, tool roll, recent mechanical restoration.', contactName: 'Archive desk', vehicleId: 'vintage-velora-berlinetta', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'ml-2', title: '2023 Aurora Sutra · certified', year: 2023, askingPrice: 3799000, odometerKm: 28400, condition: 'Certified pre-owned', city: 'Mumbai', notes: 'One owner, ceramic coat, remaining dual-motor warranty.', contactName: 'Aurora Line BKC', vehicleId: 'used-aureon-x1', createdAt: new Date(Date.now() - 172800000).toISOString() },
]

export const getAnyVehicleById = (id: string | undefined) => allVehicles.find((vehicle) => vehicle.id === id)
export const vehiclesByKind = (kind: NonNullable<Vehicle['listingKind']>) =>
  allVehicles.filter((vehicle) => (vehicle.listingKind ?? 'NEW') === kind)
