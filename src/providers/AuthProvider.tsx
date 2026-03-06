import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import client from '@/api/client'

export interface AuthUser {
  userId: string
  tenantId: string
  email: string
  fullName: string
  roles: string[]
}

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
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On every app load, restore session by calling /me.
  // The JWT lives in the httpOnly cookie — JS cannot read it directly.
  // /me reads the cookie server-side and returns the user info.
  useEffect(() => {
    client
      .get<AuthUser>('/api/auth/me')
      .then((r) => setUser(r.data))
      .catch((err: unknown) => {
        // 401 = not logged in. Any other error (network, server) = don't redirect,
        // keep user null so PrivateRoute handles the redirect.
        if (
          err &&
          typeof err === 'object' &&
          'response' in err &&
          (err as { response?: { status?: number } }).response?.status !== 401
        ) {
          // Network error — don't clear existing session aggressively
        }
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback((data: AuthUser) => {
    setUser(data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await client.post('/api/auth/logout')
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
