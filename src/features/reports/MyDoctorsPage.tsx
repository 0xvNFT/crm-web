import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import { useKpiMyDoctors } from '@/api/endpoints/reports'
import { useTerritories } from '@/api/endpoints/territories'
import { useStaffSearch } from '@/api/endpoints/users'
import { useRole } from '@/hooks/useRole'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { CURRENT_YEAR, CURRENT_MONTH, MONTHS } from './components/kpi-constants'
import type { MyDoctorsRow } from '@/api/app-types'

// ─── Adoption badge ────────────────────────────────────────────────────────────

const ADOPTION_STYLES: Record<string, string> = {
  unaware:  'bg-gray-100  text-gray-600   border-gray-200',
  aware:    'bg-blue-50   text-blue-700   border-blue-200',
  user:     'bg-green-50  text-green-700  border-green-200',
  advocate: 'bg-purple-50 text-purple-700 border-purple-200',
  champion: 'bg-amber-50  text-amber-700  border-amber-200',
}

function AdoptionBadge({ stage }: { stage: string | null | undefined }) {
  const label = stage ?? 'unaware'
  const style = ADOPTION_STYLES[label] ?? ADOPTION_STYLES.unaware
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  )
}

// ─── Class badge ───────────────────────────────────────────────────────────────

const CLASS_STYLES: Record<string, string> = {
  A: 'bg-green-50  text-green-700  border-green-200',
  B: 'bg-blue-50   text-blue-700   border-blue-200',
  C: 'bg-gray-100  text-gray-600   border-gray-200',
}

function ClassBadge({ cls }: { cls: string | null | undefined }) {
  if (!cls) return <span className="text-muted-foreground">—</span>
  const style = CLASS_STYLES[cls] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${style}`}>
      {cls}
    </span>
  )
}

// ─── Table ─────────────────────────────────────────────────────────────────────

function DoctorsTable({ rows }: { rows: MyDoctorsRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="h-10 w-10 text-muted-foreground/30 mb-3" strokeWidth={1.5} />
        <p className="text-sm font-medium text-foreground">No doctors found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Try a different period, rep, or territory.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 sticky top-0">
          <tr>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Doctor</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Specialty</th>
            <th className="px-4 py-2.5 text-center font-medium text-muted-foreground whitespace-nowrap">Class</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Adoption</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Account / Clinic</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Territory</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Rep</th>
            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground whitespace-nowrap">Visits</th>
            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">Last Visit</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={`${row.contactId}-${row.territoryId}`} className="hover:bg-muted/20">
              <td className="px-4 py-3 font-medium whitespace-nowrap">
                {row.contactName ?? '—'}
                {row.prcNumber && (
                  <span className="block text-xs text-muted-foreground font-normal">
                    PRC {row.prcNumber}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {row.specialty ?? '—'}
              </td>
              <td className="px-4 py-3 text-center">
                <ClassBadge cls={row.customerClass} />
              </td>
              <td className="px-4 py-3">
                <AdoptionBadge stage={row.adoptionStage} />
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">{row.accountName ?? '—'}</p>
                {row.accountAddress && (
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.accountAddress}</p>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {row.territoryName ?? '—'}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {row.repName ?? '—'}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {row.totalVisits ?? 0}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {row.lastVisitDate ?? <span className="text-destructive/70">Not visited</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MyDoctorsPage() {
  const navigate = useNavigate()
  const { isAdmin, isManager } = useRole()
  const canFilterByRep = isAdmin || isManager

  const [year, setYear]           = useState(CURRENT_YEAR)
  const [month, setMonth]         = useState(CURRENT_MONTH)
  const [repId, setRepId]         = useState<string | undefined>(undefined)
  const [territoryId, setTerritoryId] = useState<string | undefined>(undefined)
  const [repQuery, setRepQuery]   = useState('')
  const debouncedRepQuery         = useDebounce(repQuery, 300)

  const { data: repResults, isLoading: isSearchingReps } = useStaffSearch(debouncedRepQuery)
  const { data: territoriesPage } = useTerritories(0, 100, {})

  const repOptions: ComboboxOption[] = (repResults ?? []).map((u) => ({
    value: u.id!,
    label: u.fullName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
  }))

  const territoryOptions: ComboboxOption[] = [
    { value: '', label: 'All Territories' },
    ...(territoriesPage?.content ?? []).map((t) => ({
      value: t.id!,
      label: t.territoryName ?? t.id!,
    })),
  ]

  const { data: rows = [], isLoading, isError } = useKpiMyDoctors({
    year,
    month,
    repId:       repId || undefined,
    territoryId: territoryId || undefined,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Doctors"
        description="HCP call list by territory — specialty, class, adoption stage, and visit activity"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports/kpi')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            KPI Reports
          </Button>
        }
      />

      {/* Filters */}
      <div className="rounded-xl border bg-background p-4 flex flex-wrap items-end gap-4">
        {/* Year */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Year</span>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="h-8 w-24 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[CURRENT_YEAR - 1, CURRENT_YEAR].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Month</span>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((name, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Territory */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Territory</span>
          <div className="w-52">
            <Combobox
              value={territoryId ?? ''}
              onChange={(v) => setTerritoryId(v || undefined)}
              options={territoryOptions}
              placeholder="All territories"
            />
          </div>
        </div>

        {/* Rep — ADMIN/MANAGER only */}
        {canFilterByRep && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Rep</span>
            <div className="w-52">
              <Combobox
                value={repId ?? ''}
                onChange={(v) => setRepId(v || undefined)}
                options={repOptions}
                placeholder="All reps"
                onSearchChange={setRepQuery}
                isLoading={isSearchingReps}
              />
            </div>
          </div>
        )}

        {/* Summary pill */}
        {!isLoading && !isError && (
          <div className="ml-auto self-end">
            <span className="text-xs text-muted-foreground">
              {rows.length} doctor{rows.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Class:</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500 inline-block" />A — Priority</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />B — Standard</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-400 inline-block" />C — Low frequency</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-background overflow-hidden">
        {isLoading ? (
          <div className="py-16"><LoadingSpinner /></div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-destructive">
            Failed to load doctor list. Please try again.
          </div>
        ) : (
          <DoctorsTable rows={rows} />
        )}
      </div>
    </div>
  )
}
