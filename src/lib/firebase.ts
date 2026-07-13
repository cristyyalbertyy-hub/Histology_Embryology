import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

export const PACKAGE_ID =
  (import.meta.env.VITE_PACKAGE_ID as string | undefined) ?? 'histology-embryology'

export const STORE_URL =
  (import.meta.env.VITE_STORE_URL as string | undefined) ??
  'https://medical-science-lilac.vercel.app/precos/'

export const ACCOUNT_URL =
  (import.meta.env.VITE_ACCOUNT_URL as string | undefined) ??
  'https://medical-science-lilac.vercel.app/conta/'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase não configurado. Defina as variáveis VITE_FIREBASE_*.')
  }
  if (!app) app = initializeApp(firebaseConfig)
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp())
  return auth
}

export function getFirestoreDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp())
  return db
}

export function authContinueUrl(): string {
  return `${window.location.origin}${window.location.pathname}`
}

export const EMAIL_FOR_SIGN_IN_KEY = 'studio9.emailForSignIn'

const STUDIO9_DISPLAY_EMAIL_KEY = 'studio9.displayEmail'

export function persistStudio9LaunchEmail(email: string | null): void {
  const value = email?.trim()
  if (!value) return
  try {
    sessionStorage.setItem(STUDIO9_DISPLAY_EMAIL_KEY, value)
    sessionStorage.setItem('studio9_from_conta', '1')
  } catch {
    /* ignore */
  }
}

export function getStudio9DisplayEmail(): string | null {
  try {
    return sessionStorage.getItem(STUDIO9_DISPLAY_EMAIL_KEY)
  } catch {
    return null
  }
}

export function clearStudio9SessionMarkers(): void {
  try {
    sessionStorage.removeItem(STUDIO9_DISPLAY_EMAIL_KEY)
    sessionStorage.removeItem('studio9_from_conta')
    sessionStorage.removeItem('studio9_open_package')
  } catch {
    /* ignore */
  }
}
