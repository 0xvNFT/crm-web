import axios from 'axios'

// In dev: VITE_API_BASE_URL is empty — requests go to localhost:5173/api (Vite proxy forwards to backend)
// In prod: VITE_API_BASE_URL must be set via GitHub Secrets → injected at build time in deploy.yml
// if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
//   console.error('[client] VITE_API_BASE_URL is not set in production build. All API calls will fail.')
// }

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor: redirect to /login on 401
client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !['/login', '/verify-email', '/reset-password', '/forgot-password', '/accept-invite'].includes(window.location.pathname)
    ) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
