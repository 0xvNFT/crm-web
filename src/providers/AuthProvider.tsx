import { createContext, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { useMe } from '@/api/endpoints/auth'
import { authEvents } from '@/api/authEvents'
import type { AuthUser } from '@/api/app-types'

export type { AuthUser }

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: AuthUser) => void
  logout: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const qc = useQueryClient()
  const navigate = useNavigate()

  // H-2: Auth user state managed by React Query — useMe() calls GET /api/v1/auth/me.
  // useUpdateProfile invalidates ['me'] → this query refetches → user.fullName stays in sync.
  // staleTime: Infinity means it only refetches when explicitly invalidated, not on every focus.
  const { data: user = null, isLoading } = useMe()

  // H-3: Listen for 401 events from Axios interceptor and do a soft React Router navigation.
  // Using a ref for navigate to avoid stale closure issues in the effect.
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  useEffect(() => {
    return authEvents.onUnauthorized(() => {
      // Invalidate the ['me'] query so the next render sees null user
      qc.setQueryData(['me'], null)
      navigateRef.current('/login', { replace: true })
    })
  }, [qc])

  // login: called after a successful login mutation to update the cache directly
  const login = useCallback(
    (data: AuthUser) => {
      qc.setQueryData(['me'], data)
    },
    [qc]
  )

  // logout: clear server-side cookie then wipe the cache
  const logout = useCallback(async () => {
    try {
      const { default: client } = await import('@/api/client')
      await client.post('/api/v1/auth/logout')
    } finally {
      qc.setQueryData(['me'], null)
      qc.clear()
      navigateRef.current('/login', { replace: true })
    }
  }, [qc])

  // Keep Sentry user context in sync with auth state — errors are attributable to a real user.
  useEffect(() => {
    if (user) {
      Sentry.setUser({ id: user.userId, email: user.email, username: user.fullName })
    } else {
      Sentry.setUser(null)
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
