import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AuthProvider } from './context/AuthContext'

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

if (import.meta.env.DEV && !googleClientId) {
  console.warn(
    '[Google Sign-In] Set VITE_GOOGLE_CLIENT_ID in frontend/.env (see frontend/.env.example). ' +
      'It must match GOOGLE_CLIENT_ID in the backend .env — use your OAuth 2.0 Web client ID from Google Cloud Console.'
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
