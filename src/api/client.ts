import axios from 'axios'
import { toast } from '@/hooks/useToast'
import { authEvents } from '@/api/authEvents'

// In dev: VITE_API_BASE_URL is empty — requests go to localhost:5173/api (Vite proxy forwards to backend)
// In prod: VITE_API_BASE_URL must be set via GitHub Secrets → injected at build time in deploy.yml
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  throw new Error('[client] VITE_API_BASE_URL is not set in production build. All API calls will fail.')
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor: handle auth errors and surface network/server failures
client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status

      // 401 — session expired or unauthenticated; trigger soft redirect via React Router.
      // AuthProvider listens to authEvents.onUnauthorized and calls navigate('/login').
      // This preserves all React state and query cache (no full page reload).
      if (
        status === 401 &&
        !['/login', '/verify-email', '/reset-password', '/forgot-password', '/accept-invite'].includes(window.location.pathname)
      ) {
        authEvents.emitUnauthorized()
      }

      // 5xx or no response (network down) — show a global toast.
      // Individual mutations still receive the rejection and show their own toasts via onError.
      // This covers background queries that have no onError handler.
      if (!error.response) {
        toast('Network error — check your connection', { variant: 'destructive' })
      } else if (status !== undefined && status >= 500) {
        toast('Server error — please try again later', { variant: 'destructive' })
      }
    }

    return Promise.reject(error)
  }
)

export default client
