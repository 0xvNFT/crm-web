import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const AccountListPage = lazy(() => import('@/features/accounts/AccountListPage'))

// Intern-owned feature pages (scaffold — replace with real pages as interns build them)
const PlaceholderPage = lazy(() => import('@/features/_placeholder/PlaceholderPage'))

function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Wrap><LoginPage /></Wrap>} />
        <Route path="/forgot-password" element={<Wrap><ForgotPasswordPage /></Wrap>} />

        {/* Protected routes */}
        <Route
          element={
            <PrivateRoute>
              <AppShell />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Wrap><DashboardPage /></Wrap>} />
          <Route path="/accounts" element={<Wrap><AccountListPage /></Wrap>} />

          {/* Intern pages — swap PlaceholderPage with real components as they're built */}
          <Route path="/contacts" element={<Wrap><PlaceholderPage name="Contacts" /></Wrap>} />
          <Route path="/leads" element={<Wrap><PlaceholderPage name="Leads" /></Wrap>} />
          <Route path="/orders" element={<Wrap><PlaceholderPage name="Orders" /></Wrap>} />
          <Route path="/quotes" element={<Wrap><PlaceholderPage name="Quotes" /></Wrap>} />
          <Route path="/activities" element={<Wrap><PlaceholderPage name="Activities" /></Wrap>} />
          <Route path="/visits" element={<Wrap><PlaceholderPage name="Visits" /></Wrap>} />

          {/* Manager+ routes */}
          <Route
            path="/territories"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><PlaceholderPage name="Territories" /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><PlaceholderPage name="Teams" /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><PlaceholderPage name="Reports" /></Wrap>
              </RoleRoute>
            }
          />

          {/* Admin-only */}
          <Route
            path="/admin"
            element={
              <RoleRoute roles={['ADMIN']}>
                <Wrap><PlaceholderPage name="Admin" /></Wrap>
              </RoleRoute>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
