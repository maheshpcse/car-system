/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENVIRONMENT?: 'development' | 'production'
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ASSET_BASE_URL?: string
  readonly VITE_DEMO_MODE?: string
  readonly VITE_REPOSITORY_URL?: string
}
