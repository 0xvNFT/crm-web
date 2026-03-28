import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Target, Users, MapPin, BarChart2, Settings } from 'lucide-react'
import {
  useKpiCallSummary,
  useKpiActivitySummary,
  useKpiDoctorCoverage,
  useKpiTerritoryPerformance,
} from '@/api/endpoints/reports'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatLabel } from '@/utils/formatters'
import type {
  KpiCallSummaryRow,
  KpiActivitySummaryRow,
  KpiDoctorCoverageRow,
  KpiTerritoryPerformanceRow,
} from '@/api/app-types'

// ─── Constants ────────────────────────────────────────────────────────────────

const CALL_RATE_TARGET = 90
const COMPLIANCE_TARGET = 85
const REACH_TARGET = 90

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const QUARTERS = ['Q1 (Jan–Mar)', 'Q2 (Apr–Jun)', 'Q3 (Jul–Sep)', 'Q4 (Oct–Dec)']

// ─── KPI indicator ────────────────────────────────────────────────────────────
// green ≥ target, yellow within 10pp of target, red below

interface KpiBadgeProps {
  value: number
  target: number
  noTarget?: boolean
}

function KpiBadge({ value, target, noTarget }: KpiBadgeProps) {
  if (noTarget || value === 0) {
    return <span className="text-xs text-muted-foreground font-medium">No target set</span>
  }
  const pct = Math.round(value)
  const isGreen = pct >= target
  const isYellow = !isGreen && pct >= target - 10

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        isGreen  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'  : '',
        isYellow ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : '',
        !isGreen && !isYellow ? 'bg-destructive/10 text-destructive' : '',
      ].join(' ')}
    >
      {pct}%
    </span>
  )
}

// ─── Shared section wrapper ────────────────────────────────────────────────────

function KpiSection({ title, icon: Icon, children, isLoading }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  isLoading?: boolean
}) {
  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {isLoading ? (
        <div className="py-10"><LoadingSpinner /></div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </div>
  )
}

// ─── Call Summary table ────────────────────────────────────────────────────────

function CallSummaryTable({ rows }: { rows: KpiCallSummaryRow[] }) {
  if (rows.length === 0) {
    return <p className="px-5 py-8 text-sm text-muted-foreground">No data for this period.</p>
  }
  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/40">
        <tr>
          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Rep</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Visits</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Target</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
            Call Rate
            <span className="ml-1 text-xs font-normal opacity-60">≥{CALL_RATE_TARGET}%</span>
          </th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
            Compliance
            <span className="ml-1 text-xs font-normal opacity-60">≥{COMPLIANCE_TARGET}%</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((row) => {
          const noTarget = !row.targetVisits
          return (
            <tr key={row.repId} className="hover:bg-muted/20">
              <td className="px-4 py-3 font-medium text-foreground">{row.repName ?? '—'}</td>
              <td className="px-4 py-3 text-right">{row.completedVisits ?? 0} / {row.totalVisits ?? 0}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{noTarget ? '—' : row.targetVisits}</td>
              <td className="px-4 py-3 text-right">
                <KpiBadge value={row.callRatePct ?? 0} target={CALL_RATE_TARGET} noTarget={noTarget} />
              </td>
              <td className="px-4 py-3 text-right">
                <KpiBadge value={row.callCompliancePct ?? 0} target={COMPLIANCE_TARGET} noTarget={noTarget} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Activity Summary table ────────────────────────────────────────────────────

function ActivitySummaryTable({ rows }: { rows: KpiActivitySummaryRow[] }) {
  if (rows.length === 0) {
    return <p className="px-5 py-8 text-sm text-muted-foreground">No data for this period.</p>
  }

  // Group by rep
  const byRep = rows.reduce<Record<string, { repName: string; activities: KpiActivitySummaryRow[] }>>(
    (acc, row) => {
      const key = row.repId ?? 'unknown'
      if (!acc[key]) acc[key] = { repName: row.repName ?? '—', activities: [] }
      acc[key].activities.push(row)
      return acc
    },
    {}
  )

  const activityTypes = [...new Set(rows.map((r) => r.activityType))]

  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/40">
        <tr>
          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Rep</th>
          {activityTypes.map((t) => (
            <th key={t} className="px-4 py-2.5 text-right font-medium text-muted-foreground">
              {formatLabel(t)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {Object.entries(byRep).map(([repId, { repName, activities }]) => (
          <tr key={repId} className="hover:bg-muted/20">
            <td className="px-4 py-3 font-medium text-foreground">{repName}</td>
            {activityTypes.map((type) => {
              const a = activities.find((x) => x.activityType === type)
              return (
                <td key={type} className="px-4 py-3 text-right">
                  {a ? `${a.completedCount} / ${a.totalCount}` : '—'}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Doctor Coverage table ─────────────────────────────────────────────────────

function DoctorCoverageTable({ rows }: { rows: KpiDoctorCoverageRow[] }) {
  if (rows.length === 0) {
    return <p className="px-5 py-8 text-sm text-muted-foreground">No data for this period.</p>
  }
  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/40">
        <tr>
          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Rep</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Doctors Visited</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Target</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
            Call Reach
            <span className="ml-1 text-xs font-normal opacity-60">≥{REACH_TARGET}%</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((row) => {
          const noTarget = !row.targetContacts
          return (
            <tr key={row.repId} className="hover:bg-muted/20">
              <td className="px-4 py-3 font-medium text-foreground">{row.repName ?? '—'}</td>
              <td className="px-4 py-3 text-right">{row.uniqueContactsVisited ?? 0}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{noTarget ? '—' : row.targetContacts}</td>
              <td className="px-4 py-3 text-right">
                <KpiBadge value={row.callReachPct ?? 0} target={REACH_TARGET} noTarget={noTarget} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Territory Performance table ──────────────────────────────────────────────

function TerritoryPerformanceTable({ rows }: { rows: KpiTerritoryPerformanceRow[] }) {
  if (rows.length === 0) {
    return <p className="px-5 py-8 text-sm text-muted-foreground">No data for this period.</p>
  }
  return (
    <table className="w-full text-sm">
      <thead className="bg-muted/40">
        <tr>
          <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Territory</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Visits</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Target</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Unique Contacts</th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
            Call Rate
            <span className="ml-1 text-xs font-normal opacity-60">≥{CALL_RATE_TARGET}%</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((row) => {
          const noTarget = !row.targetVisitsTotal
          return (
            <tr key={row.territoryId} className="hover:bg-muted/20">
              <td className="px-4 py-3 font-medium text-foreground">{row.territoryName ?? '—'}</td>
              <td className="px-4 py-3 text-right">{row.completedVisits ?? 0} / {row.totalVisits ?? 0}</td>
              <td className="px-4 py-3 text-right text-muted-foreground">{noTarget ? '—' : row.targetVisitsTotal}</td>
              <td className="px-4 py-3 text-right">{row.uniqueContacts ?? 0}</td>
              <td className="px-4 py-3 text-right">
                <KpiBadge value={row.callRatePct ?? 0} target={CALL_RATE_TARGET} noTarget={noTarget} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Period selector ──────────────────────────────────────────────────────────

interface PeriodSelectorProps {
  year: number
  month: number
  quarter: number
  onYearChange: (y: number) => void
  onMonthChange: (m: number) => void
  onQuarterChange: (q: number) => void
}

function PeriodSelector({ year, month, quarter, onYearChange, onMonthChange, onQuarterChange }: PeriodSelectorProps) {
  const years = [CURRENT_YEAR - 1, CURRENT_YEAR]
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Year</span>
        <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger className="h-8 w-24 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Month</span>
        <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
          <SelectTrigger className="h-8 w-32 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((name, i) => <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Quarter</span>
        <Select value={String(quarter)} onValueChange={(v) => onQuarterChange(Number(v))}>
          <SelectTrigger className="h-8 w-28 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUARTERS.map((name, i) => <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KpiReportsPage() {
  const navigate = useNavigate()
  const { isAdmin, isManager } = useRole()

  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  const [quarter, setQuarter] = useState(Math.ceil(CURRENT_MONTH / 3))

  const monthPeriod = { year, month }
  const quarterPeriod = { year, quarter }

  const callSummary = useKpiCallSummary(monthPeriod)
  const activitySummary = useKpiActivitySummary(monthPeriod)
  const doctorCoverage = useKpiDoctorCoverage(monthPeriod)
  const territoryPerf = useKpiTerritoryPerformance(quarterPeriod)

  return (
    <div className="space-y-6">
      <PageHeader
        title="KPI Reports"
        description="Field force call rate, compliance, reach, and territory performance"
        actions={
          <div className="flex items-center gap-2">
            {(isAdmin || isManager) && (
              <Button variant="outline" size="sm" onClick={() => navigate('/reports/kpi/targets')}>
                <Settings className="h-4 w-4 mr-1.5" />
                Manage Targets
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              All Reports
            </Button>
          </div>
        }
      />

      {/* Period selector */}
      <div className="rounded-xl border bg-background p-4">
        <PeriodSelector
          year={year}
          month={month}
          quarter={quarter}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onQuarterChange={setQuarter}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Monthly metrics use Year + Month. Territory Performance uses Year + Quarter.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />
          On target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block" />
          Within 10% of target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive inline-block" />
          Below target
        </span>
      </div>

      {/* Call Summary */}
      <KpiSection title="Call Summary" icon={Target} isLoading={callSummary.isLoading}>
        {callSummary.isError ? (
          <p className="px-5 py-6 text-sm text-destructive">Failed to load call summary.</p>
        ) : (
          <CallSummaryTable rows={callSummary.data ?? []} />
        )}
      </KpiSection>

      {/* Doctor Coverage */}
      <KpiSection title="Doctor Coverage (Call Reach)" icon={Users} isLoading={doctorCoverage.isLoading}>
        {doctorCoverage.isError ? (
          <p className="px-5 py-6 text-sm text-destructive">Failed to load doctor coverage.</p>
        ) : (
          <DoctorCoverageTable rows={doctorCoverage.data ?? []} />
        )}
      </KpiSection>

      {/* Activity Summary */}
      <KpiSection title="Activity Summary" icon={BarChart2} isLoading={activitySummary.isLoading}>
        {activitySummary.isError ? (
          <p className="px-5 py-6 text-sm text-destructive">Failed to load activity summary.</p>
        ) : (
          <ActivitySummaryTable rows={activitySummary.data ?? []} />
        )}
      </KpiSection>

      {/* Territory Performance — MANAGER+ only */}
      {(isAdmin || isManager) && (
        <KpiSection title={`Territory Performance — ${QUARTERS[quarter - 1]}`} icon={MapPin} isLoading={territoryPerf.isLoading}>
          {territoryPerf.isError ? (
            <p className="px-5 py-6 text-sm text-destructive">Failed to load territory performance.</p>
          ) : (
            <TerritoryPerformanceTable rows={territoryPerf.data ?? []} />
          )}
        </KpiSection>
      )}
    </div>
  )
}
