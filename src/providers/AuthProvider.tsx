import { createContext, useState, useCallback, type ReactNode } from 'react'
import client from '@/api/client'
import type { AuthResponse } from '@/api/app-types'

interface AuthUser {
  userId: string
  tenantId: string
  email: string
  fullName: string
  role: 'ADMIN' | 'MANAGER' | 'FIELD_REP'
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (data: AuthResponse) => void
  logout: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem('crm_user')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser)

  const login = useCallback((data: AuthResponse) => {
    const u: AuthUser = {
      userId: data.userId,
      tenantId: data.tenantId,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
    }
    sessionStorage.setItem('crm_user', JSON.stringify(u))
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try {
      await client.post('/api/auth/logout')
    } finally {
      sessionStorage.removeItem('crm_user')
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
