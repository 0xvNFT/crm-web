import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { AppRouter } from './routes'
import { Toaster } from './components/ui/toaster'

// BrowserRouter is at the root so AuthProvider can use useNavigate (needed for soft 401 redirect).
// Provider order: ErrorBoundary > BrowserRouter > QueryProvider > AuthProvider > Routes
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <AppRouter />
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
