import { useMemo, type ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { LoginScreen } from './LoginScreen'
import { NoAccessScreen } from './NoAccessScreen'

function isFromContaHandoff(): boolean {
  if (typeof window === 'undefined') return false
  return (
    new URLSearchParams(window.location.search).has('studio9_handoff') ||
    sessionStorage.getItem('studio9_from_conta') === '1'
  )
}

type AuthGateProps = {
  children: ReactNode
  appTitle: string
}

/** Acesso livre temporário enquanto Biology/Genetics estão em piloto de compra. */
const OPEN_ACCESS = true

export function AuthGate({ children, appTitle }: AuthGateProps) {
  const { loading, user, entitlementLoading, hasAccess, configured } = useAuth()
  const fromConta = useMemo(() => isFromContaHandoff(), [])

  if (OPEN_ACCESS) {
    return <>{children}</>
  }

  if (!configured) {
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <h1 className="app-brand">{appTitle}</h1>
          <p className="form-error" role="alert">
            Login temporariamente indisponível.
          </p>
        </div>
      </div>
    )
  }

  if (hasAccess) {
    return <>{children}</>
  }

  if (loading || (user && entitlementLoading)) {
    if (fromConta && user) {
      return null
    }
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <h1 className="app-brand">{appTitle}</h1>
          <p className="auth-hint">A verificar acesso…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen appTitle={appTitle} />
  }

  return <NoAccessScreen appTitle={appTitle} />
}
