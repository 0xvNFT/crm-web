import axios from 'axios'
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
    // Ignore request cancellations (AbortController signal) — not a real error.
    if (axios.isCancel(error)) return Promise.reject(error)

    if (axios.isAxiosError(error)) {
      const status = error.response?.status

      // 401 — session expired or unauthenticated; trigger soft redirect via React Router.
      // AuthProvider listens to authEvents.onUnauthorized and calls navigate('/login').
      // This preserves all React state and query cache (no full page reload).
      // Exclude auth endpoints themselves — a failed login/reset must not redirect to /login.
      const requestUrl = error.config?.url ?? ''
      if (status === 401 && !requestUrl.includes('/api/v1/auth/')) {
        authEvents.emitUnauthorized()
      }

    }

    return Promise.reject(error)
  }
)

export default client
