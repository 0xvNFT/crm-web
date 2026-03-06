import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { type ReactNode } from 'react'
import type { AuthResponse } from '@/api/app-types'

type Role = AuthResponse['role']

interface RoleRouteProps {
  roles: Role[]
  children: ReactNode
}

export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
