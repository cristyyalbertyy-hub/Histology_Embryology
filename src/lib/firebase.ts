import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

declare global {
  interface Window {
    STUDIO9_FIREBASE?: {
      apiKey: string
      authDomain: string
      projectId: string
      appId: string
    }
  }
}

export const PACKAGE_ID =
  (import.meta.env.VITE_PACKAGE_ID as string | undefined) ?? 'histology-embryology'

export const STORE_URL =
  (import.meta.env.VITE_STORE_URL as string | undefined) ??
  'https://studio9medical.com/precos/'

export const ACCOUNT_URL =
  (import.meta.env.VITE_ACCOUNT_URL as string | undefined) ??
  'https://studio9medical.com/conta/'

const firebaseConfig = {
  apiKey:
    (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) ??
    window.STUDIO9_FIREBASE?.apiKey ??
    'AIzaSyBq-jO-0acTpRr0DESA27CKvNMCzEHESlc',
  authDomain:
    (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) ??
    window.STUDIO9_FIREBASE?.authDomain ??
    'studio9-medical.firebaseapp.com',
  projectId:
    (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) ??
    window.STUDIO9_FIREBASE?.projectId ??
    'studio9-medical',
  appId:
    (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined) ??
    window.STUDIO9_FIREBASE?.appId ??
    '1:872255591899:web:f21955ad7e22bc42af83fe',
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
const STUDIO9_OPEN_PACKAGE_KEY = 'studio9.openPackage'

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


export function persistStudio9OpenPackage(packageId: string | null): void {
  const value = packageId?.trim()
  if (!value) return
  try {
    sessionStorage.setItem(STUDIO9_OPEN_PACKAGE_KEY, value)
  } catch {
    /* ignore */
  }
}

export function getStudio9OpenPackage(): string | null {
  try {
    return sessionStorage.getItem(STUDIO9_OPEN_PACKAGE_KEY)
  } catch {
    return null
  }
}

export function clearStudio9SessionMarkers(): void {
  try {
    sessionStorage.removeItem(STUDIO9_DISPLAY_EMAIL_KEY)
    sessionStorage.removeItem('studio9_from_conta')
    sessionStorage.removeItem(STUDIO9_OPEN_PACKAGE_KEY)
  } catch {
    /* ignore */
  }
}
