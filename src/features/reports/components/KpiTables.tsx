import { formatLabel } from '@/utils/formatters'
import { KpiBadge } from './KpiShared'
import { CALL_RATE_TARGET, COMPLIANCE_TARGET, REACH_TARGET } from './kpi-constants'
import type {
  KpiCallSummaryRow,
  KpiActivitySummaryRow,
  KpiDoctorCoverageRow,
  KpiTerritoryPerformanceRow,
} from '@/api/app-types'

// ─── Call Summary table ────────────────────────────────────────────────────────

export function CallSummaryTable({ rows }: { rows: KpiCallSummaryRow[] }) {
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
            Call Rate<span className="ml-1 text-xs font-normal opacity-60">≥{CALL_RATE_TARGET}%</span>
          </th>
          <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">
            Compliance<span className="ml-1 text-xs font-normal opacity-60">≥{COMPLIANCE_TARGET}%</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((row) => {
          const noTarget = row.targetVisits == null
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

export function ActivitySummaryTable({ rows }: { rows: KpiActivitySummaryRow[] }) {
  if (rows.length === 0) {
    return <p className="px-5 py-8 text-sm text-muted-foreground">No data for this period.</p>
  }

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

export function DoctorCoverageTable({ rows }: { rows: KpiDoctorCoverageRow[] }) {
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
            Call Reach<span className="ml-1 text-xs font-normal opacity-60">≥{REACH_TARGET}%</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((row) => {
          const noTarget = row.targetContacts == null
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

export function TerritoryPerformanceTable({ rows }: { rows: KpiTerritoryPerformanceRow[] }) {
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
            Call Rate<span className="ml-1 text-xs font-normal opacity-60">≥{CALL_RATE_TARGET}%</span>
          </th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {rows.map((row) => {
          const noTarget = row.targetVisitsTotal == null
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
