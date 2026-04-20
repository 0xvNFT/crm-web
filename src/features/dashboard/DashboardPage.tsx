import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from './components/StatCard'
import { PipelineChart } from './components/PipelineChart'
import { LeadFunnelChart } from './components/LeadFunnelChart'
import { ActivityChart } from './components/ActivityChart'
import { RepTargetsWidget } from './components/RepTargetsWidget'
import { useDashboardStats } from './hooks/useDashboardStats'
import { usePipelineSummary, useLeadFunnelSummary, useActivitySummary } from '@/api/endpoints/reports'
import { Building2, Target, ShoppingCart, Activity, CalendarCheck } from 'lucide-react'
import { OverdueFollowUpsWidget } from './components/OverdueFollowUpsWidget'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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

      {/* ── KPI Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {isRepOnly ? (
          <>
            <StatCard label="My Visits"      value={myVisits.data ?? '—'}   icon={CalendarCheck} loading={myVisits.isLoading} />
            <StatCard label="My Activities"  value={activities.data ?? '—'} icon={Activity}      loading={activities.isLoading} />
            <StatCard label="Accounts"       value={accounts.data ?? '—'}   icon={Building2}     loading={accounts.isLoading} />
            <StatCard label="My Leads"       value={leads.data ?? '—'}      icon={Target}        loading={leads.isLoading} />
          </>
        ) : (
          <>
            <StatCard label="Total Accounts" value={accounts.data ?? '—'}      icon={Building2}    loading={accounts.isLoading} />
            <StatCard label="Total Leads"    value={leads.data ?? '—'}         icon={Target}       loading={leads.isLoading} />
            <StatCard label="Pending Orders" value={pendingOrders.data ?? '—'} icon={ShoppingCart} loading={pendingOrders.isLoading} />
            <StatCard label="Activities"     value={activities.data ?? '—'}    icon={Activity}     loading={activities.isLoading} />
          </>
        )}
      </div>

      {/* ── Tabbed analytics ──────────────────────────────────────────────────── */}
      {isRepOnly ? (
        // REP view: Overview charts + My Targets tab
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="targets">My Targets</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5 mt-4">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
          </TabsContent>

          <TabsContent value="targets" className="mt-4">
            {user?.userId && (
              <RepTargetsWidget
                repId={user.userId}
                visitCount={myVisits.data ?? 0}
                activityCount={activities.data ?? 0}
                leadCount={leads.data ?? 0}
                loadingStats={myVisits.isLoading || activities.isLoading || leads.isLoading}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        // MANAGER/ADMIN view: Overview + Team tab
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5 mt-4">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
          </TabsContent>

          <TabsContent value="team" className="space-y-5 mt-4">
            <PipelineChart
              data={pipeline.data}
              isLoading={pipeline.isLoading}
              isError={pipeline.isError}
              error={pipeline.error}
              onRetry={() => pipeline.refetch()}
            />
            <OverdueFollowUpsWidget />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
