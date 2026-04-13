import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from './components/StatCard'
import { PipelineChart } from './components/PipelineChart'
import { LeadFunnelChart } from './components/LeadFunnelChart'
import { ActivityChart } from './components/ActivityChart'
import { useDashboardStats } from './hooks/useDashboardStats'
import { usePipelineSummary, useLeadFunnelSummary, useActivitySummary } from '@/api/endpoints/reports'
import { Building2, Target, ShoppingCart, Activity } from 'lucide-react'
import { OverdueFollowUpsWidget } from './components/OverdueFollowUpsWidget'

export default function DashboardPage() {
  const { user } = useAuth()
  const { isManager } = useRole()
  const { accounts, leads, pendingOrders, activities } = useDashboardStats()
  const pipeline = usePipelineSummary()
  const leadFunnel = useLeadFunnelSummary()
  const activitySummary = useActivitySummary()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${getTimeOfDay()}, ${user?.fullName?.split(' ')[0] ?? 'there'}`}
        description="Here's what's happening across your field force today."
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
      </div>

      {/* Pipeline chart — full width */}
      {isManager && (
        <PipelineChart
          data={pipeline.data}
          isLoading={pipeline.isLoading}
          isError={pipeline.isError}
          error={pipeline.error}
          onRetry={() => pipeline.refetch()}
        />
      )}

      {/* Lead Funnel + Activity Breakdown — side by side on lg+ */}
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
