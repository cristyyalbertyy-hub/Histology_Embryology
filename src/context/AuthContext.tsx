import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  signInWithCustomToken,
  setPersistence,
  browserLocalPersistence,
  type User,
} from 'firebase/auth'
import {
  authContinueUrl,
  EMAIL_FOR_SIGN_IN_KEY,
  getFirebaseAuth,
  isFirebaseConfigured,
} from '../lib/firebase'
import { fetchActiveEntitlement, type Entitlement } from '../lib/entitlements'

type AuthContextValue = {
  loading: boolean
  user: User | null
  userEmail: string | null
  entitlement: Entitlement | null
  entitlementLoading: boolean
  entitlementError: string | null
  hasAccess: boolean
  configured: boolean
  sendMagicLink: (email: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  refreshEntitlement: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function cleanEmailLinkFromUrl(): void {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('apiKey') && !url.searchParams.has('oobCode')) return
  url.searchParams.delete('apiKey')
  url.searchParams.delete('oobCode')
  url.searchParams.delete('mode')
  url.searchParams.delete('lang')
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [user, setUser] = useState<User | null>(null)
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null)
  const [entitlementLoading, setEntitlementLoading] = useState(false)
  const [entitlementError, setEntitlementError] = useState<string | null>(null)

  const refreshEntitlement = useCallback(async () => {
    if (!user) {
      setEntitlement(null)
      return
    }
    setEntitlementLoading(true)
    setEntitlementError(null)
    try {
      const active = await fetchActiveEntitlement(user.uid)
      setEntitlement(active)
      if (active) {
        sessionStorage.removeItem('studio9_from_conta')
      }
      if (!active) {
        setEntitlementError(
          'Nenhum entitlement activo para este módulo. Confirme Firestore → entitlements com o vosso UID e package_id correcto.',
        )
      }
    } catch (err) {
      setEntitlement(null)
      const message =
        err instanceof Error ? err.message : 'Erro ao ler entitlements.'
      setEntitlementError(message)
    } finally {
      setEntitlementLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const auth = getFirebaseAuth()
    let mounted = true

    async function bootstrap() {
      try {
        const auth = getFirebaseAuth()
        await setPersistence(auth, browserLocalPersistence)

        const params = new URLSearchParams(window.location.search)
        const handoff = params.get('studio9_handoff')
        if (handoff) {
          sessionStorage.setItem('studio9_from_conta', '1')
          await signInWithCustomToken(auth, handoff)
          params.delete('studio9_handoff')
          const rest = params.toString()
          window.history.replaceState(
            null,
            '',
            `${window.location.pathname}${rest ? `?${rest}` : ''}${window.location.hash}`,
          )
        }

        if (isSignInWithEmailLink(auth, window.location.href)) {
          let email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY)
          if (!email) {
            email = window.prompt(
              'Confirme o email usado para pedir o link de acesso',
            )
          }
          if (email) {
            await signInWithEmailLink(auth, email, window.location.href)
            window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY)
            cleanEmailLinkFromUrl()
          }
        }
      } catch {
        // Mantém fluxo de login normal se o link expirou ou falhou.
      }
    }

    void bootstrap()

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!mounted) return
      setUser(nextUser)
      setLoading(false)
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setEntitlement(null)
      setEntitlementLoading(false)
      return
    }
    void refreshEntitlement()
  }, [user, refreshEntitlement])

  const sendMagicLink = useCallback(async (email: string) => {
    if (!isFirebaseConfigured) {
      return { error: 'Autenticação indisponível — contacte o suporte.' }
    }
    const auth = getFirebaseAuth()
    try {
      await sendSignInLinkToEmail(auth, email.trim(), {
        url: authContinueUrl(),
        handleCodeInApp: true,
      })
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email.trim())
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar link.'
      if (message.includes('auth/quota-exceeded')) {
        return {
          error:
            'Limite diário de emails atingido. Tente amanhã ou abra a app num separador onde já tenha sessão.',
        }
      }
      return { error: message }
    }
  }, [])

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured) return
    sessionStorage.removeItem('studio9_from_conta')
    await signOut(getFirebaseAuth())
    setEntitlement(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      userEmail: user?.email ?? null,
      entitlement,
      entitlementLoading,
      entitlementError,
      hasAccess: Boolean(entitlement),
      configured: isFirebaseConfigured,
      sendMagicLink,
      logout,
      refreshEntitlement,
    }),
    [
      loading,
      user,
      entitlement,
      entitlementLoading,
      entitlementError,
      sendMagicLink,
      logout,
      refreshEntitlement,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
