import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { useKpiSalesPerformance } from '@/api/endpoints/reports'
import { useStaffSearch } from '@/api/endpoints/users'
import { useRole } from '@/hooks/useRole'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader } from '@/components/shared/PageHeader'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { PeriodSelector } from './components/KpiShared'
import { CURRENT_YEAR, CURRENT_MONTH } from './components/kpi-constants'
import { formatCurrency } from '@/utils/formatters'
import type { KpiSalesPerformanceRow } from '@/api/app-types'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatPeso(value: number | null | undefined): string {
  if (value == null) return '—'
  return formatCurrency(value)
}

function AchievementBadge({ pct }: { pct: number | null | undefined }) {
  if (pct == null) return <span className="text-muted-foreground text-xs">No target</span>
  const color =
    pct >= 100 ? 'bg-green-50 text-green-700 border-green-200'
    : pct >= 90  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
    : 'bg-red-50 text-red-700 border-red-200'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tabular-nums ${color}`}>
      {pct.toFixed(1)}%
    </span>
  )
}

// ─── Column definitions ─────────────────────────────────────────────────────────

type Row = KpiSalesPerformanceRow & { id: string }

const COLUMNS: Column<Row>[] = [
  {
    header: 'Rep',
    sortable: true,
    accessor: 'repName',
    cell: (row) => <span className="font-medium">{row.repName ?? '—'}</span>,
  },
  {
    header: 'Net Sales',
    sortable: true,
    accessor: 'netSales',
    cell: (row) => (
      <span className="tabular-nums font-medium">
        {formatPeso(row.netSales)}
      </span>
    ),
    className: 'text-right',
  },
  {
    header: 'Target',
    sortable: true,
    accessor: 'targetSales',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {(row.targetSales ?? 0) > 0
          ? formatPeso(row.targetSales)
          : <span className="text-xs">Not set</span>}
      </span>
    ),
    className: 'text-right',
  },
  {
    header: 'Achievement',
    sortable: true,
    accessor: 'achievementPct',
    cell: (row) => <AchievementBadge pct={row.achievementPct} />,
    className: 'text-center',
  },
  {
    header: 'Balance',
    sortable: true,
    accessor: 'balance',
    cell: (row) => {
      const val = row.balance
      if (val == null) return <span className="text-muted-foreground">—</span>
      const isOver = val >= 0
      return (
        <span className={`tabular-nums font-medium ${isOver ? 'text-green-600' : 'text-red-600'}`}>
          {isOver ? '+' : ''}{formatPeso(val)}
        </span>
      )
    },
    className: 'text-right',
  },
]

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function SalesPerformancePage() {
  const navigate = useNavigate()
  const { isAdmin, isManager } = useRole()
  const canFilterByRep = isAdmin || isManager

  const [year, setYear]           = useState(CURRENT_YEAR)
  const [month, setMonth]         = useState(CURRENT_MONTH)
  const [repId, setRepId]         = useState<string | undefined>(undefined)
  const [repQuery, setRepQuery]   = useState('')
  const debouncedRepQuery         = useDebounce(repQuery, 300)

  const { data: repResults, isLoading: isSearchingReps } = useStaffSearch(debouncedRepQuery)

  const repOptions: ComboboxOption[] = (repResults ?? []).map((u) => ({
    value: u.id!,
    label: u.fullName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
  }))

  const { data: rows = [], isLoading, isError, error, refetch } = useKpiSalesPerformance({
    year,
    month,
    repId: repId !== '' ? repId : undefined,
  })

  const tableRows: Row[] = rows.map((r) => ({ ...r, id: r.repId ?? '' }))

  // Totals row
  const totalNetSales    = rows.reduce((s, r) => s + (r.netSales    ?? 0), 0)
  const totalTargetSales = rows.reduce((s, r) => s + (r.targetSales ?? 0), 0)
  const totalBalance    = totalNetSales - totalTargetSales
  const totalAchievement = totalTargetSales > 0 ? (totalNetSales / totalTargetSales) * 100 : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Performance"
        description="Net sales vs monthly target per rep — achievement % and balance"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports/kpi')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
            KPI Reports
          </Button>
        }
      />

      {/* Filters */}
      <div className="rounded-xl border bg-background p-4 flex flex-wrap items-end gap-4">
        <PeriodSelector
          year={year}
          month={month}
          onYearChange={setYear}
          onMonthChange={setMonth}
        />

        {canFilterByRep && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Rep</span>
            <div className="w-52">
              <Combobox
                value={repId ?? ''}
                onChange={(v) => setRepId(v !== '' ? v : undefined)}
                options={repOptions}
                placeholder="All reps"
                onSearchChange={setRepQuery}
                isLoading={isSearchingReps}
              />
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" /> ≥ 100% On target
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block" /> 90–99% Within 10%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" /> &lt; 90% Below target
        </span>
      </div>

      {/* Table */}
      {isLoading && <ListPageSkeleton />}
      {!isLoading && isError && (
        <ErrorMessage error={error} onRetry={() => refetch()} />
      )}
      {!isLoading && !isError && (
        <div className="rounded-xl border bg-background overflow-hidden">
          <DataTable
            columns={COLUMNS}
            data={tableRows}
            empty={{
              icon: TrendingUp,
              title: 'No sales data',
              description: 'No orders found for this period.',
            }}
            totalElements={tableRows.length}
          />

          {/* Summary footer */}
          {tableRows.length > 1 && (
            <div className="border-t px-4 py-3 flex flex-wrap items-center gap-6 text-sm bg-muted/30">
              <span className="font-semibold text-foreground">Grand Total</span>
              <span className="tabular-nums font-medium ml-auto">
                {formatPeso(totalNetSales)}
                <span className="text-muted-foreground font-normal ml-1">
                  / {totalTargetSales > 0 ? formatPeso(totalTargetSales) : 'No target'}
                </span>
              </span>
              <AchievementBadge pct={totalAchievement} />
              <span className={`tabular-nums font-medium ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance >= 0 ? '+' : ''}{formatPeso(totalBalance)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
