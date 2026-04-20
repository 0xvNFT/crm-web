import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import './index.css'
import { ErrorBoundary } from './components/shared/ErrorBoundary'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { AppRouter } from './routes'
import { Toaster } from './components/ui/toaster'
import { TooltipProvider } from './components/ui/tooltip'

// Sentry is only active when VITE_SENTRY_DSN is set (production builds).
// In dev/test it is a no-op — no DSN means no network requests, no side effects.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    environment: import.meta.env.MODE,
    // Attach the build hash baked by vite.config.ts so each release is distinguishable.
    release: __APP_VERSION__,
    // Sample 100% of errors; adjust tracesSampleRate when adding performance monitoring.
    tracesSampleRate: 0,
    // Ignore noise that is not actionable.
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
    ],
  })
}

// BrowserRouter is at the root so AuthProvider can use useNavigate (needed for soft 401 redirect).
// Provider order: ErrorBoundary > BrowserRouter > QueryProvider > AuthProvider > Routes
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider delayDuration={300}>
              <AppRouter />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
