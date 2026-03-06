import axios from 'axios'

// In dev: VITE_API_BASE_URL is empty — requests go to localhost:5173/api (Vite proxy forwards to backend)
// In prod: VITE_API_BASE_URL is the backend URL — requests go directly
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
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/verify-email'
    ) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default client
