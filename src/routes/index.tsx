import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import type { Role } from '@/api/app-types'

const NotFoundPage = lazy(() => import('@/features/errors/NotFoundPage'))
import { PrivateRoute } from './PrivateRoute'
import { RoleRoute } from './RoleRoute'

// Roles that can perform write operations (create/edit/delete)
const WRITE_ROLES: Role[] = ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'CSR']
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/skeleton'

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@/features/auth/VerifyEmailPage'))
const AcceptInvitePage = lazy(() => import('@/features/auth/AcceptInvitePage'))
const ForceChangePasswordPage = lazy(() => import('@/features/auth/ForceChangePasswordPage'))

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
const KpiReportsPage = lazy(() => import('@/features/reports/KpiReportsPage'))
const RepTargetsPage = lazy(() => import('@/features/reports/RepTargetsPage'))
const MyDoctorsPage = lazy(() => import('@/features/reports/MyDoctorsPage'))
const SalesPerformancePage = lazy(() => import('@/features/reports/SalesPerformancePage'))
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
const OrderEditPage = lazy(() => import('@/features/orders/OrderEditPage'))
const ActivityListPage = lazy(() => import('@/features/activities/ActivityListPage'))
const ActivityDetailPage = lazy(() => import('@/features/activities/ActivityDetailPage'))
const ActivityFormPage = lazy(() => import('@/features/activities/ActivityFormPage'))
const LeadFormPage = lazy(() => import('@/features/leads/LeadFormPage'))
const OpportunityFormPage = lazy(() => import('@/features/opportunities/OpportunityFormPage'))
const QuoteListPage = lazy(() => import('@/features/quotes/QuoteListPage'))
const QuoteDetailPage = lazy(() => import('@/features/quotes/QuoteDetailPage'))
const QuoteFormPage = lazy(() => import('@/features/quotes/QuoteFormPage'))
const QuoteEditPage = lazy(() => import('@/features/quotes/QuoteEditPage'))

const InvoiceListPage = lazy(() => import('@/features/invoices/InvoiceListPage'))
const InvoiceDetailPage = lazy(() => import('@/features/invoices/InvoiceDetailPage'))
const InvoiceFormPage = lazy(() => import('@/features/invoices/InvoiceFormPage'))
const OpportunityListPage = lazy(() => import('@/features/opportunities/OpportunityListPage'))
const OpportunityDetailPage = lazy(() => import('@/features/opportunities/OpportunityDetailPage'))

const CampaignListPage   = lazy(() => import('@/features/campaigns/CampaignListPage'))
const CampaignDetailPage = lazy(() => import('@/features/campaigns/CampaignDetailPage'))
const CampaignFormPage   = lazy(() => import('@/features/campaigns/CampaignFormPage'))
const CoachingListPage = lazy(() => import('@/features/coaching/CoachingListPage'))
const CoachingDetailPage = lazy(() => import('@/features/coaching/CoachingDetailPage'))
const CoachingFormPage = lazy(() => import('@/features/coaching/CoachingFormPage'))
const ProductListPage = lazy(() => import('@/features/products/ProductListPage'))
const ProductDetailPage = lazy(() => import('@/features/products/ProductDetailPage'))
const ProductFormPage = lazy(() => import('@/features/products/ProductFormPage'))
const BillingPage = lazy(() => import('@/features/billing/BillingPage'))
const MaterialListPage = lazy(() => import('@/features/materials/MaterialListPage'))
const AuditLogPage = lazy(() => import('@/features/audit/AuditLogPage'))
const MaterialDetailPage = lazy(() => import('@/features/materials/MaterialDetailPage'))
const PipelineSettingsPage = lazy(() => import('@/features/pipeline/PipelineSettingsPage'))


function Wrap({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Skeleton className="h-screen w-full" />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Wrap><LoginPage /></Wrap>} />
        <Route path="/register" element={<Wrap><RegisterPage /></Wrap>} />
        <Route path="/forgot-password" element={<Wrap><ForgotPasswordPage /></Wrap>} />
        <Route path="/reset-password" element={<Wrap><ResetPasswordPage /></Wrap>} />
        <Route path="/verify-email" element={<Wrap><VerifyEmailPage /></Wrap>} />
        <Route path="/accept-invite" element={<Wrap><AcceptInvitePage /></Wrap>} />
        {/* Force password change — protected (must be logged in) but outside AppShell */}
        <Route
          path="/change-password"
          element={
            <PrivateRoute>
              <Wrap><ForceChangePasswordPage /></Wrap>
            </PrivateRoute>
          }
        />

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
          <Route
            path="/contacts/new"
            element={
              <RoleRoute roles={WRITE_ROLES}>
                <Wrap><ContactFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/contacts/:id" element={<Wrap><ContactDetailPage /></Wrap>} />
          <Route path="/leads" element={<Wrap><LeadListPage /></Wrap>} />
          <Route
            path="/leads/new"
            element={
              <RoleRoute roles={WRITE_ROLES}>
                <Wrap><LeadFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/leads/:id/edit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><LeadFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/leads/:id" element={<Wrap><LeadDetailPage /></Wrap>} />
          <Route path="/orders" element={<Wrap><OrderListPage /></Wrap>} />
          <Route
            path="/orders/new"
            element={
              <RoleRoute roles={WRITE_ROLES}>
                <Wrap><OrderFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/orders/:id/edit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'CSR']}>
                <Wrap><OrderEditPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/orders/:id" element={<Wrap><OrderDetailPage /></Wrap>} />
          <Route path="/quotes" element={<Wrap><QuoteListPage /></Wrap>} />
          <Route
            path="/quotes/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER']}>
                <Wrap><QuoteFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/quotes/:id/edit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><QuoteEditPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/quotes/:id" element={<Wrap><QuoteDetailPage /></Wrap>} />
          <Route path="/activities" element={<Wrap><ActivityListPage /></Wrap>} />
          <Route
            path="/activities/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER']}>
                <Wrap><ActivityFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/activities/:id/edit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER']}>
                <Wrap><ActivityFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/activities/:id" element={<Wrap><ActivityDetailPage /></Wrap>} />
          <Route path="/invoices" element={<Wrap><InvoiceListPage /></Wrap>} />
          <Route
            path="/invoices/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'CSR']}>
                <Wrap><InvoiceFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/invoices/:id/edit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'CSR']}>
                <Wrap><InvoiceFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/invoices/:id" element={<Wrap><InvoiceDetailPage /></Wrap>} />
          <Route path="/opportunities" element={<Wrap><OpportunityListPage /></Wrap>} />
          <Route
            path="/opportunities/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER']}>
                <Wrap><OpportunityFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/opportunities/:id/edit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER']}>
                <Wrap><OpportunityFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/opportunities/:id" element={<Wrap><OpportunityDetailPage /></Wrap>} />
          {/* Campaigns — all authenticated roles can view; write: ADMIN/MANAGER only */}
          <Route path="/campaigns" element={<Wrap><CampaignListPage /></Wrap>} />
          <Route
            path="/campaigns/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><CampaignFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/campaigns/:id/edit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><CampaignFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/campaigns/:id" element={<Wrap><CampaignDetailPage /></Wrap>} />
          <Route path="/visits" element={<Wrap><VisitListPage /></Wrap>} />
          <Route
            path="/visits/new"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER']}>
                <Wrap><VisitScheduleFormPage /></Wrap>
              </RoleRoute>
            }
          />
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
          <Route
            path="/coaching/:id"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><CoachingDetailPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/coaching/:id/edit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><CoachingFormPage /></Wrap>
              </RoleRoute>
            }
          />

          {/* Territories — read: FIELD_REP + READ_ONLY; write: ADMIN/MANAGER only */}
          <Route
            path="/territories"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'READ_ONLY']}>
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
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'READ_ONLY']}>
                <Wrap><TerritoryDetailPage /></Wrap>
              </RoleRoute>
            }
          />
          {/* Teams — all non-CSR roles can view; write: ADMIN/MANAGER only */}
          <Route
            path="/teams"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY']}>
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
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY']}>
                <Wrap><TeamDetailPage /></Wrap>
              </RoleRoute>
            }
          />
          {/* Materials — all authenticated roles can view */}
          <Route path="/materials" element={<Wrap><MaterialListPage /></Wrap>} />
          <Route path="/materials/:id" element={<Wrap><MaterialDetailPage /></Wrap>} />
          {/* Products — all authenticated roles can view; write: ADMIN only */}
          <Route path="/products" element={<Wrap><ProductListPage /></Wrap>} />
          <Route
            path="/products/new"
            element={
              <RoleRoute roles={['ADMIN']}>
                <Wrap><ProductFormPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route path="/products/:id" element={<Wrap><ProductDetailPage /></Wrap>} />
          <Route
            path="/products/:id/edit"
            element={
              <RoleRoute roles={['ADMIN']}>
                <Wrap><ProductFormPage /></Wrap>
              </RoleRoute>
            }
          />
          {/* Reports — all non-CSR roles */}
          <Route
            path="/reports"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY']}>
                <Wrap><ReportsPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/reports/kpi"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY']}>
                <Wrap><KpiReportsPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/reports/kpi/targets"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><RepTargetsPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/reports/kpi/my-doctors"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY']}>
                <Wrap><MyDoctorsPage /></Wrap>
              </RoleRoute>
            }
          />
          <Route
            path="/reports/kpi/sales-performance"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY']}>
                <Wrap><SalesPerformancePage /></Wrap>
              </RoleRoute>
            }
          />

          {/* Audit log — ADMIN/MANAGER only */}
          <Route
            path="/audit"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><AuditLogPage /></Wrap>
              </RoleRoute>
            }
          />

          {/* Pipeline stage settings — ADMIN/MANAGER only */}
          <Route
            path="/settings/pipeline"
            element={
              <RoleRoute roles={['ADMIN', 'MANAGER']}>
                <Wrap><PipelineSettingsPage /></Wrap>
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
          {import.meta.env.VITE_BILLING_ENABLED === 'true' && (
            <Route
              path="/billing"
              element={
                <RoleRoute roles={['ADMIN']}>
                  <Wrap><BillingPage /></Wrap>
                </RoleRoute>
              }
            />
          )}
        </Route>

        {/* Catch-all — show 404 instead of silent redirect so users know the URL was wrong */}
        <Route path="*" element={<Wrap><NotFoundPage /></Wrap>} />
      </Routes>
  )
}
