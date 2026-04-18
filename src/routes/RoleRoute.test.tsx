import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { RoleRoute } from './RoleRoute'
import type { Role } from '@/api/app-types'

vi.mock('@/hooks/useAuth')
import { useAuth } from '@/hooks/useAuth'
const mockUseAuth = vi.mocked(useAuth)

function renderWithRouter(roles: Role[], userRoles: Role[]) {
  mockUseAuth.mockReturnValue({
    user: userRoles.length
      ? { userId: '1', tenantId: 't1', email: 'a@b.com', fullName: 'Alice', roles: userRoles }
      : null,
    isAuthenticated: userRoles.length > 0,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  })
  return render(
    <MemoryRouter initialEntries={['/restricted']}>
      <Routes>
        <Route
          path="/restricted"
          element={
            <RoleRoute roles={roles}>
              <div>Restricted content</div>
            </RoleRoute>
          }
        />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('RoleRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders children when user has a matching role', () => {
    renderWithRouter(['MANAGER'], ['MANAGER'])
    expect(screen.getByText('Restricted content')).toBeTruthy()
  })

  it('renders children when user has ADMIN and route requires MANAGER', () => {
    renderWithRouter(['MANAGER', 'ADMIN'], ['ADMIN'])
    expect(screen.getByText('Restricted content')).toBeTruthy()
  })

  it('redirects to /dashboard when user lacks required role', () => {
    renderWithRouter(['MANAGER'], ['FIELD_REP'])
    expect(screen.getByText('Dashboard')).toBeTruthy()
  })

  it('redirects to /dashboard when user is null (unauthenticated)', () => {
    renderWithRouter(['MANAGER'], [])
    expect(screen.getByText('Dashboard')).toBeTruthy()
  })

  it('redirects READ_ONLY users away from write routes', () => {
    renderWithRouter(['ADMIN', 'MANAGER', 'FIELD_REP'], ['READ_ONLY'])
    expect(screen.getByText('Dashboard')).toBeTruthy()
  })
})
