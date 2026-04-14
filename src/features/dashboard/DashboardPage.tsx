import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from './components/StatCard'
import { PipelineChart } from './components/PipelineChart'
import { LeadFunnelChart } from './components/LeadFunnelChart'
import { ActivityChart } from './components/ActivityChart'
import { useDashboardStats } from './hooks/useDashboardStats'
import { usePipelineSummary, useLeadFunnelSummary, useActivitySummary } from '@/api/endpoints/reports'
import { Building2, Target, ShoppingCart, Activity, CalendarCheck } from 'lucide-react'
import { OverdueFollowUpsWidget } from './components/OverdueFollowUpsWidget'

export default function DashboardPage() {
  const { user } = useAuth()
  const { isManager, isRep } = useRole()
  const isRepOnly = isRep && !isManager

  // FIELD_REP: scope visits to their own userId so the count reflects personal activity
  const repId = isRepOnly ? user?.userId : undefined
  const { accounts, leads, pendingOrders, activities, myVisits } = useDashboardStats({ repId })

  const pipeline = usePipelineSummary({ enabled: isManager })
  const leadFunnel = useLeadFunnelSummary()
  const activitySummary = useActivitySummary()

  // Dashboard description differs by role: REPs see personal context, managers see org-wide
  const description = isManager
    ? "Here's what's happening across your field force today."
    : "Here's a snapshot of your field activity today."

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${getTimeOfDay()}, ${user?.fullName?.split(' ')[0] ?? 'there'}`}
        description={description}
      />

      {/* KPI Stats — FIELD_REP sees personal stats; MANAGER/ADMIN sees org-wide */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isRepOnly ? (
          // FIELD_REP: personal stats that matter for daily field work
          <>
            <StatCard
              label="My Visits"
              value={myVisits.data ?? '—'}
              icon={CalendarCheck}
              loading={myVisits.isLoading}
            />
            <StatCard
              label="My Activities"
              value={activities.data ?? '—'}
              icon={Activity}
              loading={activities.isLoading}
            />
            <StatCard
              label="Accounts"
              value={accounts.data ?? '—'}
              icon={Building2}
              loading={accounts.isLoading}
            />
            <StatCard
              label="My Leads"
              value={leads.data ?? '—'}
              icon={Target}
              loading={leads.isLoading}
            />
          </>
        ) : (
          // MANAGER / ADMIN: org-wide overview
          <>
            <StatCard
              label="Total Accounts"
              value={accounts.data ?? '—'}
              icon={Building2}
              loading={accounts.isLoading}
            />
            <StatCard
              label="Total Leads"
              value={leads.data ?? '—'}
              icon={Target}
              loading={leads.isLoading}
            />
            <StatCard
              label="Pending Orders"
              value={pendingOrders.data ?? '—'}
              icon={ShoppingCart}
              loading={pendingOrders.isLoading}
            />
            <StatCard
              label="Activities"
              value={activities.data ?? '—'}
              icon={Activity}
              loading={activities.isLoading}
            />
          </>
        )}
      </div>

      {/* Pipeline chart — MANAGER/ADMIN only: org-level pipeline visibility */}
      {isManager && (
        <PipelineChart
          data={pipeline.data}
          isLoading={pipeline.isLoading}
          isError={pipeline.isError}
          error={pipeline.error}
          onRetry={() => pipeline.refetch()}
        />
      )}

      {/* Lead Funnel + Activity Breakdown — all roles see these (backend scopes REP data) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LeadFunnelChart
          data={leadFunnel.data}
          isLoading={leadFunnel.isLoading}
          isError={leadFunnel.isError}
          error={leadFunnel.error}
          onRetry={() => leadFunnel.refetch()}
        />
        <ActivityChart
          data={activitySummary.data}
          isLoading={activitySummary.isLoading}
          isError={activitySummary.isError}
          error={activitySummary.error}
          onRetry={() => activitySummary.refetch()}
        />
      </div>

      {/* Overdue follow-ups — MANAGER/ADMIN only: coaching oversight tool */}
      {isManager && <OverdueFollowUpsWidget />}
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
