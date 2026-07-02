import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { AuthGate } from './components/AuthGate'
import { courseTitle } from './data/curriculum'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate appTitle={courseTitle}>
        <App />
      </AuthGate>
    </AuthProvider>
  </StrictMode>,
)
