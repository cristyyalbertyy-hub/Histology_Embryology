import { useAuth } from '../context/AuthContext'
import { STORE_URL } from '../lib/firebase'

type NoAccessScreenProps = {
  appTitle: string
}

export function NoAccessScreen({ appTitle }: NoAccessScreenProps) {
  const { userEmail, user, logout, refreshEntitlement, entitlementLoading, entitlementError } =
    useAuth()

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="app-brand">{appTitle}</h1>
        <p className="auth-hint">
          Sessão iniciada como <strong>{userEmail}</strong>, mas este email ainda
          não tem acesso activo a este módulo.
        </p>
        <p className="auth-hint">
          Após a compra, o acesso online fica disponível durante 1 ano.
        </p>
        {user?.uid ? (
          <p className="auth-hint">
            UID da sessão: <code>{user.uid}</code>
          </p>
        ) : null}
        {entitlementError ? (
          <p className="form-error" role="alert">
            {entitlementError}
          </p>
        ) : null}
        <div className="auth-actions">
          <a className="btn btn-primary" href={STORE_URL}>
            Comprar acesso
          </a>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={entitlementLoading}
            onClick={() => void refreshEntitlement()}
          >
            {entitlementLoading ? 'A verificar…' : 'Verificar acesso'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
            Terminar sessão
          </button>
        </div>
      </div>
    </div>
  )
}
