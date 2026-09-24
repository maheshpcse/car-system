/**
 * Runtime environment configuration.
 * Values come from Vite env files (`.env`, `.env.production`) and are read once.
 * Components must not reference `import.meta.env` directly — use `env`.
 */
export type AppEnvironment = 'development' | 'production'

export interface Environment {
  appEnvironment: AppEnvironment
  apiBaseUrl: string
  assetBaseUrl: string
  demoMode: boolean
  /** Public base path the app is served from (e.g. "/car-system/"). */
  basePath: string
  appName: string
  repositoryUrl: string
}

const truthy = (value: string | undefined, fallback: boolean) =>
  value === undefined ? fallback : value === 'true' || value === '1'

/** Empty `.env` values are still strings; treat them as unset. */
const present = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export const env: Environment = {
  appEnvironment: (present(import.meta.env.VITE_APP_ENVIRONMENT) as AppEnvironment | undefined) ?? (import.meta.env.PROD ? 'production' : 'development'),
  apiBaseUrl: present(import.meta.env.VITE_API_BASE_URL) ?? '',
  assetBaseUrl: present(import.meta.env.VITE_ASSET_BASE_URL) ?? import.meta.env.BASE_URL,
  demoMode: truthy(import.meta.env.VITE_DEMO_MODE, true),
  basePath: import.meta.env.BASE_URL,
  appName: 'Aurora Motors',
  repositoryUrl: present(import.meta.env.VITE_REPOSITORY_URL) ?? 'https://github.com/maheshpcse/car-system',
}

export const assetUrl = (path: string) => {
  const base = env.assetBaseUrl || env.basePath || '/'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}
