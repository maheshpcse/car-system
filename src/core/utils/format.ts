const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const number = new Intl.NumberFormat('en-US')

export const formatPrice = (value: number) => currency.format(value)
export const formatPriceCompact = (value: number) => compactCurrency.format(value)
export const formatNumber = (value: number) => number.format(value)
export const formatPower = (hp: number) => `${formatNumber(hp)} hp`
export const formatRange = (km: number) => `${formatNumber(km)} km`
export const formatAcceleration = (s: number) => `${s.toFixed(1)} s`
export const formatSpeed = (kmh: number) => `${formatNumber(kmh)} km/h`
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ')
