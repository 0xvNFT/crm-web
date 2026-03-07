import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@/features/auth/VerifyEmailPage'))

// App pages
const ProfilePage = lazy(() => import('@/features/auth/ProfilePage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const AccountListPage = lazy(() => import('@/features/accounts/AccountListPage'))
const AccountDetailPage = lazy(() => import('@/features/accounts/AccountDetailPage'))
const AccountFormPage = lazy(() => import('@/features/accounts/AccountFormPage'))
const ContactListPage = lazy(() => import('@/features/contacts/ContactListPage'))
const ContactDetailPage = lazy(() => import('@/features/contacts/ContactDetailPage'))
const ContactFormPage = lazy(() => import('@/features/contacts/ContactFormPage'))

// Intern-owned pages — swap PlaceholderPage with the real component as each is built
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
        <Route path="/register" element={<Wrap><RegisterPage /></Wrap>} />
        <Route path="/forgot-password" element={<Wrap><ForgotPasswordPage /></Wrap>} />
        <Route path="/reset-password" element={<Wrap><ResetPasswordPage /></Wrap>} />
        <Route path="/verify-email" element={<Wrap><VerifyEmailPage /></Wrap>} />

        {/* Protected routes — all nested inside AppShell */}
        <Route
          element={
            <PrivateRoute>
              <AppShell />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Wrap><DashboardPage /></Wrap>} />
          <Route path="/profile" element={<Wrap><ProfilePage /></Wrap>} />
          <Route path="/accounts" element={<Wrap><AccountListPage /></Wrap>} />
          <Route path="/accounts/new" element={<Wrap><AccountFormPage /></Wrap>} />
          <Route path="/accounts/:id" element={<Wrap><AccountDetailPage /></Wrap>} />

          {/* Intern pages — replace PlaceholderPage as each feature is completed */}
          <Route path="/contacts" element={<Wrap><ContactListPage /></Wrap>} />
          <Route path="/contacts/new" element={<Wrap><ContactFormPage /></Wrap>} />
          <Route path="/contacts/:id" element={<Wrap><ContactDetailPage /></Wrap>} />
          <Route path="/leads" element={<Wrap><PlaceholderPage name="Leads" /></Wrap>} />
          <Route path="/orders" element={<Wrap><PlaceholderPage name="Orders" /></Wrap>} />
          <Route path="/quotes" element={<Wrap><PlaceholderPage name="Quotes" /></Wrap>} />
          <Route path="/activities" element={<Wrap><PlaceholderPage name="Activities" /></Wrap>} />
          <Route path="/visits" element={<Wrap><PlaceholderPage name="Visits" /></Wrap>} />

          {/* MANAGER+ only */}
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

          {/* ADMIN only */}
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
