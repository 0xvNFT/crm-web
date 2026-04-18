import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { type ReactNode } from 'react'
import type { Role } from '@/api/app-types'

interface RoleRouteProps {
  roles: Role[]
  children: ReactNode
}

// RoleRoute must always be nested inside PrivateRoute.
// PrivateRoute blocks rendering while isLoading=true, so by the time RoleRoute
// evaluates `user`, it is always resolved (null = not authenticated, or a real AuthUser).
export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user || !user.roles.some((r) => roles.includes(r))) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
