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
const LeadListPage = lazy(() => import('@/features/leads/LeadListPage'))
const LeadDetailPage = lazy(() => import('@/features/leads/LeadDetailPage'))
const OrderListPage = lazy(() => import('@/features/orders/OrderListPage'))
const OrderDetailPage = lazy(() => import('@/features/orders/OrderDetailPage'))
const OrderFormPage = lazy(() => import('@/features/orders/OrderFormPage'))
const ActivityListPage = lazy(() => import('@/features/activities/ActivityListPage'))
const ActivityDetailPage = lazy(() => import('@/features/activities/ActivityDetailPage'))
const ActivityFormPage = lazy(() => import('@/features/activities/ActivityFormPage'))
const LeadFormPage = lazy(() => import('@/features/leads/LeadFormPage'))
const OpportunityFormPage = lazy(() => import('@/features/opportunities/OpportunityFormPage'))
const QuoteListPage = lazy(() => import('@/features/quotes/QuoteListPage'))
const QuoteDetailPage = lazy(() => import('@/features/quotes/QuoteDetailPage'))
const QuoteFormPage = lazy(() => import('@/features/quotes/QuoteFormPage'))

const InvoiceListPage = lazy(() => import('@/features/invoices/InvoiceListPage'))
const InvoiceDetailPage = lazy(() => import('@/features/invoices/InvoiceDetailPage'))
const OpportunityListPage = lazy(() => import('@/features/opportunities/OpportunityListPage'))
const OpportunityDetailPage = lazy(() => import('@/features/opportunities/OpportunityDetailPage'))

const CoachingListPage = lazy(() => import('@/features/coaching/CoachingListPage'))
const CoachingDetailPage = lazy(() => import('@/features/coaching/CoachingDetailPage'))
const CoachingFormPage = lazy(() => import('@/features/coaching/CoachingFormPage'))
const ProductListPage = lazy(() => import('@/features/products/ProductListPage'))
const ProductDetailPage = lazy(() => import('@/features/products/ProductDetailPage'))
const ProductFormPage = lazy(() => import('@/features/products/ProductFormPage'))
const BillingPage = lazy(() => import('@/features/billing/BillingPage'))


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
          <Route path="/leads" element={<Wrap><LeadListPage /></Wrap>} />
          <Route path="/leads/new" element={<Wrap><LeadFormPage /></Wrap>} />
          <Route path="/leads/:id/edit" element={<Wrap><LeadFormPage /></Wrap>} />
          <Route path="/leads/:id" element={<Wrap><LeadDetailPage /></Wrap>} />
          <Route path="/orders" element={<Wrap><OrderListPage /></Wrap>} />
          <Route path="/orders/new" element={<Wrap><OrderFormPage /></Wrap>} />
          <Route path="/orders/:id" element={<Wrap><OrderDetailPage /></Wrap>} />
          <Route path="/quotes" element={<Wrap><QuoteListPage /></Wrap>} />
          <Route path="/quotes/new" element={<Wrap><QuoteFormPage /></Wrap>} />
          <Route path="/quotes/:id" element={<Wrap><QuoteDetailPage /></Wrap>} />
          <Route path="/activities" element={<Wrap><ActivityListPage /></Wrap>} />
          <Route path="/activities/new" element={<Wrap><ActivityFormPage /></Wrap>} />
          <Route path="/activities/:id/edit" element={<Wrap><ActivityFormPage /></Wrap>} />
          <Route path="/activities/:id" element={<Wrap><ActivityDetailPage /></Wrap>} />
          <Route path="/invoices" element={<Wrap><InvoiceListPage /></Wrap>} />
          <Route path="/invoices/:id" element={<Wrap><InvoiceDetailPage /></Wrap>} />
          <Route path="/opportunities" element={<Wrap><OpportunityListPage /></Wrap>} />
          <Route path="/opportunities/new" element={<Wrap><OpportunityFormPage /></Wrap>} />
          <Route path="/opportunities/:id/edit" element={<Wrap><OpportunityFormPage /></Wrap>} />
          <Route path="/opportunities/:id" element={<Wrap><OpportunityDetailPage /></Wrap>} />
          <Route path="/visits" element={<Wrap><VisitListPage /></Wrap>} />
          <Route path="/visits/new" element={<Wrap><VisitScheduleFormPage /></Wrap>} />
          <Route path="/visits/:id" element={<Wrap><VisitDetailPage /></Wrap>} />

          {/* Coaching notes — list/create/edit MANAGER+ only, detail all roles */}
          <Route
            path="/coaching"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><CoachingListPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/coaching/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><CoachingFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/coaching/:id" element={<Wrap><CoachingDetailPage /></Wrap>} />
          <Route
            path="/coaching/:id/edit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><CoachingFormPage /></Wrap>
              </RoleRoute>
            }
          />

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
            path="/teams/:id/edit"
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
            path="/products"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><ProductListPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <RoleRoute roles={['ADMIN']}>
                <Wrap><ProductFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><ProductDetailPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/products/:id/edit"
            element={
              <RoleRoute roles={['ADMIN']}>
                <Wrap><ProductFormPage /></Wrap>
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
          <Route
            path="/billing"
            element={
              <RoleRoute roles={['ADMIN']}>
                <Wrap><BillingPage /></Wrap>
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
