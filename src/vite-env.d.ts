/// <reference types="vite/client" />

declare const __PUBLIC_ASSET_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_PACKAGE_ID?: string
  readonly VITE_STORE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
