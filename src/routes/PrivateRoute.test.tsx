import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'

// Mock useAuth so tests don't need a real AuthProvider + QueryClient tree
vi.mock('@/hooks/useAuth')
import { useAuth } from '@/hooks/useAuth'
const mockUseAuth = vi.mocked(useAuth)

function renderWithRouter(
  authState: ReturnType<typeof useAuth>,
  initialPath = '/protected'
) {
  mockUseAuth.mockReturnValue(authState)
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <PrivateRoute>
              <div>Protected content</div>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/change-password" element={<div>Change password page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

const authenticatedUser = {
  user: { userId: '1', tenantId: 't1', email: 'a@b.com', fullName: 'Alice', roles: ['FIELD_REP' as const] },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
}

describe('PrivateRoute', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders children when authenticated', () => {
    renderWithRouter(authenticatedUser)
    expect(screen.getByText('Protected content')).toBeTruthy()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithRouter({
      ...authenticatedUser,
      user: null,
      isAuthenticated: false,
    })
    expect(screen.getByText('Login page')).toBeTruthy()
  })

  it('renders skeleton while loading', () => {
    renderWithRouter({
      ...authenticatedUser,
      isLoading: true,
    })
    expect(screen.queryByText('Protected content')).toBeNull()
    expect(screen.queryByText('Login page')).toBeNull()
  })

  it('redirects to /change-password when mustChangePassword is set', () => {
    renderWithRouter({
      ...authenticatedUser,
      user: { ...authenticatedUser.user, mustChangePassword: true },
    })
    expect(screen.getByText('Change password page')).toBeTruthy()
  })

  it('does not redirect to /change-password when already on that page', () => {
    mockUseAuth.mockReturnValue({
      ...authenticatedUser,
      user: { ...authenticatedUser.user, mustChangePassword: true },
    })
    render(
      <MemoryRouter initialEntries={['/change-password']}>
        <Routes>
          <Route
            path="/change-password"
            element={
              <PrivateRoute>
                <div>Change password page</div>
              </PrivateRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Change password page')).toBeTruthy()
  })
})
