import { CalendarCheck, Phone, Users, TrendingUp } from 'lucide-react'
import { useRepTargets } from '@/api/endpoints/rep-targets'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface TargetRowProps {
  label: string
  icon: LucideIcon
  actual: number
  target: number | undefined
  loading: boolean
}

function TargetRow({ label, icon: Icon, actual, target, loading }: TargetRowProps) {
  const hasTarget = target != null && target > 0
  const pct = hasTarget ? Math.min(Math.round((actual / target) * 100), 100) : 0
  const exceeded = hasTarget && actual >= target

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium text-foreground">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          {label}
        </span>
        {loading ? (
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        ) : hasTarget ? (
          <span className={cn('tabular-nums text-xs', exceeded ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground')}>
            {actual} / {target}{exceeded && ' ✓'}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{actual} / —</span>
        )}
      </div>
      {loading ? (
        <div className="h-2 animate-pulse rounded-full bg-muted" />
      ) : hasTarget ? (
        <Progress
          value={pct}
          className={cn('h-2', exceeded && '[&>div]:bg-emerald-500')}
        />
      ) : (
        <Progress value={0} className="h-2 opacity-30" />
      )}
    </div>
  )
}

interface RepTargetsWidgetProps {
  repId: string
  visitCount: number
  activityCount: number
  leadCount: number
  loadingStats: boolean
}

export function RepTargetsWidget({ repId, visitCount, activityCount, leadCount, loadingStats }: RepTargetsWidgetProps) {
  const now = new Date()
  const { data, isLoading } = useRepTargets(now.getFullYear(), now.getMonth() + 1)

  // Find this rep's target for the current month
  const target = data?.content?.find((t) => t.repId === repId)
  const loading = isLoading || loadingStats

  const monthName = now.toLocaleString('default', { month: 'long' })

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground">Monthly Targets</p>
        <p className="text-xs text-muted-foreground">{monthName} {now.getFullYear()}</p>
      </div>

      {!loading && !target && (
        <p className="text-sm text-muted-foreground">No targets set for this month. Contact your manager.</p>
      )}

      <div className="space-y-4">
        <TargetRow
          label="Visits"
          icon={CalendarCheck}
          actual={visitCount}
          target={target?.targetVisits}
          loading={loading}
        />
        <TargetRow
          label="Calls"
          icon={Phone}
          actual={activityCount}
          target={target?.targetCalls}
          loading={loading}
        />
        <TargetRow
          label="Contacts Reached"
          icon={Users}
          actual={leadCount}
          target={target?.targetContacts}
          loading={loading}
        />
        <TargetRow
          label="Sales Target"
          icon={TrendingUp}
          actual={0}
          target={target?.targetSales != null ? Math.round(target.targetSales) : undefined}
          loading={loading}
        />
      </div>
    </div>
  )
}
