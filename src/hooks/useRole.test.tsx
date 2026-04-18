import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRole } from './useRole'
import type { AuthUser } from '@/api/app-types'

// Stub useAuth so useRole tests don't need a full AuthProvider/QueryProvider tree
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from './useAuth'
const mockUseAuth = vi.mocked(useAuth)

function withUser(roles: AuthUser['roles'], extra?: Partial<AuthUser>) {
  const user: AuthUser = {
    userId: '1',
    tenantId: 't1',
    email: 'test@example.com',
    fullName: 'Test User',
    roles,
    ...extra,
  }
  mockUseAuth.mockReturnValue({
    user,
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })
}

function withNoUser() {
  mockUseAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })
}

describe('useRole', () => {
  describe('ADMIN', () => {
    it('isAdmin is true', () => {
      withUser(['ADMIN'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isAdmin).toBe(true)
    })

    it('isManager is true — ADMIN inherits MANAGER permissions', () => {
      withUser(['ADMIN'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isManager).toBe(true)
    })

    it('isRep is false', () => {
      withUser(['ADMIN'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isRep).toBe(false)
    })

    it('isReadOnly is false', () => {
      withUser(['ADMIN'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isReadOnly).toBe(false)
    })
  })

  describe('MANAGER', () => {
    it('isManager is true', () => {
      withUser(['MANAGER'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isManager).toBe(true)
    })

    it('isAdmin is false', () => {
      withUser(['MANAGER'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isAdmin).toBe(false)
    })

    it('isRep is false', () => {
      withUser(['MANAGER'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isRep).toBe(false)
    })
  })

  describe('FIELD_REP', () => {
    it('isRep is true', () => {
      withUser(['FIELD_REP'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isRep).toBe(true)
    })

    it('isManager is false', () => {
      withUser(['FIELD_REP'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isManager).toBe(false)
    })

    it('isAdmin is false', () => {
      withUser(['FIELD_REP'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isAdmin).toBe(false)
    })
  })

  describe('READ_ONLY', () => {
    it('isReadOnly is true', () => {
      withUser(['READ_ONLY'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isReadOnly).toBe(true)
    })

    it('isManager is false', () => {
      withUser(['READ_ONLY'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isManager).toBe(false)
    })

    it('isRep is false', () => {
      withUser(['READ_ONLY'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isRep).toBe(false)
    })
  })

  describe('ACCOUNT_MANAGER', () => {
    it('isAccountManager is true', () => {
      withUser(['ACCOUNT_MANAGER'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isAccountManager).toBe(true)
    })

    it('isManager is false', () => {
      withUser(['ACCOUNT_MANAGER'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isManager).toBe(false)
    })
  })

  describe('CSR', () => {
    it('isCsr is true', () => {
      withUser(['CSR'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isCsr).toBe(true)
    })

    it('isManager is false', () => {
      withUser(['CSR'])
      const { result } = renderHook(() => useRole())
      expect(result.current.isManager).toBe(false)
    })
  })

  describe('null user (logged out)', () => {
    it('all flags are false — isRep is not true for logged-out users', () => {
      withNoUser()
      const { result } = renderHook(() => useRole())
      expect(result.current.isAdmin).toBe(false)
      expect(result.current.isManager).toBe(false)
      expect(result.current.isRep).toBe(false)
      expect(result.current.isAccountManager).toBe(false)
      expect(result.current.isReadOnly).toBe(false)
      expect(result.current.isCsr).toBe(false)
    })
  })
})
