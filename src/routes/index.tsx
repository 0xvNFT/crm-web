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
const AcceptInvitePage = lazy(() => import('@/features/auth/AcceptInvitePage'))

// App pages
const ProfilePage = lazy(() => import('@/features/auth/ProfilePage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const AccountListPage = lazy(() => import('@/features/accounts/AccountListPage'))
const AccountDetailPage = lazy(() => import('@/features/accounts/AccountDetailPage'))
const AccountFormPage = lazy(() => import('@/features/accounts/AccountFormPage'))
const ContactListPage = lazy(() => import('@/features/contacts/ContactListPage'))
const ContactDetailPage = lazy(() => import('@/features/contacts/ContactDetailPage'))
const ContactFormPage = lazy(() => import('@/features/contacts/ContactFormPage'))

// Lead dev pages
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'))
const AdminPage = lazy(() => import('@/features/admin/AdminPage'))
const VisitListPage = lazy(() => import('@/features/visits/VisitListPage'))
const VisitDetailPage = lazy(() => import('@/features/visits/VisitDetailPage'))
const VisitScheduleFormPage = lazy(() => import('@/features/visits/VisitScheduleFormPage'))
const TerritoryListPage = lazy(() => import('@/features/territories/TerritoryListPage'))
const TerritoryDetailPage = lazy(() => import('@/features/territories/TerritoryDetailPage'))
const TerritoryFormPage = lazy(() => import('@/features/territories/TerritoryFormPage'))
const TeamListPage = lazy(() => import('@/features/teams/TeamListPage'))
const TeamDetailPage = lazy(() => import('@/features/teams/TeamDetailPage'))
const TeamFormPage = lazy(() => import('@/features/teams/TeamFormPage'))

// Intern-owned pages
const OrderListPage = lazy(() => import('@/features/orders/OrderListPage'))
const OrderDetailPage = lazy(() => import('@/features/orders/OrderDetailPage'))
const ActivityListPage = lazy(() => import('@/features/activities/ActivityListPage'))
const ActivityDetailPage = lazy(() => import('@/features/activities/ActivityDetailPage'))

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
        <Route path="/accept-invite" element={<Wrap><AcceptInvitePage /></Wrap>} />

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
          <Route
            path="/accounts/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><AccountFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/accounts/:id" element={<Wrap><AccountDetailPage /></Wrap>} />

          {/* Intern pages — replace PlaceholderPage as each feature is completed */}
          <Route path="/contacts" element={<Wrap><ContactListPage /></Wrap>} />
          <Route path="/contacts/new" element={<Wrap><ContactFormPage /></Wrap>} />
          <Route path="/contacts/:id" element={<Wrap><ContactDetailPage /></Wrap>} />
          <Route path="/leads" element={<Wrap><PlaceholderPage name="Leads" /></Wrap>} />
          <Route path="/orders" element={<Wrap><OrderListPage /></Wrap>} />
          <Route path="/orders/:id" element={<Wrap><OrderDetailPage /></Wrap>} />
          <Route path="/quotes" element={<Wrap><PlaceholderPage name="Quotes" /></Wrap>} />
          <Route path="/activities" element={<Wrap><ActivityListPage /></Wrap>} />
          <Route path="/activities/:id" element={<Wrap><ActivityDetailPage /></Wrap>} />
          <Route path="/visits" element={<Wrap><VisitListPage /></Wrap>} />
          <Route path="/visits/new" element={<Wrap><VisitScheduleFormPage /></Wrap>} />
          <Route path="/visits/:id" element={<Wrap><VisitDetailPage /></Wrap>} />

          {/* MANAGER+ only */}
          <Route
            path="/territories"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><TerritoryListPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/territories/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><TerritoryFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/territories/:id"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><TerritoryDetailPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><TeamListPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/teams/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><TeamFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/teams/:id"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><TeamDetailPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><ReportsPage /></Wrap>
              </RoleRoute>
            }
          />

          {/* ADMIN only */}
          <Route
            path="/admin"
            element={
              <RoleRoute roles={['ADMIN']}>
                <Wrap><AdminPage /></Wrap>
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
