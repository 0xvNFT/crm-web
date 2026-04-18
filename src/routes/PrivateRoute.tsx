import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { type ReactNode } from 'react'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

interface PrivateRouteProps {
  children: ReactNode
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Operator-provisioned accounts must set a new password before using the app
  if (user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }

  return <>{children}</>
}
