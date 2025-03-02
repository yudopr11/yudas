/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ALLOWED_HOST: string
  readonly VITE_ENCRYPTION_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 