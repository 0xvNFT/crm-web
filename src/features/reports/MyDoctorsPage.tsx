import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import { useKpiMyDoctors } from '@/api/endpoints/reports'
import { useTerritories } from '@/api/endpoints/territories'
import { useStaffSearch } from '@/api/endpoints/users'
import { useRole } from '@/hooks/useRole'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { PeriodSelector } from './components/KpiShared'
import { CURRENT_YEAR, CURRENT_MONTH } from './components/kpi-constants'
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

// ─── Column definitions — module level (not re-created per render) ─────────────

const DOCTORS_COLUMNS: Column<MyDoctorsRowWithId>[] = [
  {
    header: 'Doctor',
    sortable: true,
    accessor: 'contactName',
    cell: (row) => (
      <div>
        {row.contactId ? (
          <Link to={`/contacts/${row.contactId}`} className="font-medium hover:underline hover:text-primary">
            {row.contactName ?? '—'}
          </Link>
        ) : (
          <span className="font-medium">{row.contactName ?? '—'}</span>
        )}
        {row.prcNumber && (
          <span className="block text-xs text-muted-foreground font-normal">PRC {row.prcNumber}</span>
        )}
      </div>
    ),
  },
  {
    header: 'Specialty',
    sortable: true,
    accessor: 'specialty',
    cell: (row) => <span className="text-muted-foreground whitespace-nowrap">{row.specialty ?? '—'}</span>,
  },
  {
    header: 'Class',
    sortable: true,
    accessor: 'customerClass',
    cell: (row) => <ClassBadge cls={row.customerClass} />,
    className: 'text-center',
  },
  {
    header: 'Adoption',
    sortable: true,
    accessor: 'adoptionStage',
    cell: (row) => <AdoptionBadge stage={row.adoptionStage} />,
  },
  {
    header: 'Account / Clinic',
    sortable: true,
    accessor: 'accountName',
    cell: (row) => (
      <div>
        {row.accountId ? (
          <Link to={`/accounts/${row.accountId}`} className="font-medium hover:underline hover:text-primary">
            {row.accountName ?? '—'}
          </Link>
        ) : (
          <p className="font-medium">{row.accountName ?? '—'}</p>
        )}
        {row.accountAddress && (
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{row.accountAddress}</p>
        )}
      </div>
    ),
  },
  {
    header: 'City',
    sortable: true,
    accessor: 'addressCity',
    cell: (row) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {row.addressCity
          ? <>{row.addressCity}{row.addressProvince ? `, ${row.addressProvince}` : ''}</>
          : '—'}
      </span>
    ),
  },
  {
    header: 'Society',
    sortable: true,
    accessor: 'professionalSociety',
    cell: (row) => <span className="text-muted-foreground whitespace-nowrap">{row.professionalSociety ?? '—'}</span>,
  },
  {
    header: 'Products Detailed',
    accessor: (row) => {
      if (!row.productsDiscussed) return <span className="text-muted-foreground/50 text-xs">None detailed</span>
      const pills = row.productsDiscussed.split(', ').map((entry) => {
        const sep = entry.indexOf(':')
        if (sep === -1) return { id: null, name: entry }
        return { id: entry.slice(0, sep), name: entry.slice(sep + 1) }
      })
      return (
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {pills.map(({ id, name }) => (
            id ? (
              <Link
                key={id}
                to={`/products/${id}`}
                className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100 hover:border-blue-300"
              >
                {name}
              </Link>
            ) : (
              <span key={name} className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                {name}
              </span>
            )
          ))}
        </div>
      )
    },
  },
  {
    header: 'Territory',
    sortable: true,
    accessor: 'territoryName',
    cell: (row) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {row.territoryId ? (
          <Link to={`/territories/${row.territoryId}`} className="hover:underline hover:text-primary">
            {row.territoryName ?? '—'}
          </Link>
        ) : (row.territoryName ?? '—')}
      </span>
    ),
  },
  {
    header: 'Rep',
    sortable: true,
    accessor: 'repName',
    cell: (row) => <span className="text-muted-foreground whitespace-nowrap">{row.repName ?? '—'}</span>,
  },
  {
    header: 'Visits',
    sortable: true,
    accessor: 'totalVisits',
    cell: (row) => <span className="tabular-nums">{row.totalVisits ?? 0}</span>,
    className: 'text-right',
  },
  {
    header: 'Last Visit',
    sortable: true,
    accessor: 'lastVisitDate',
    cell: (row) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {row.lastVisitDate ?? <span className="text-destructive/70">Not visited</span>}
      </span>
    ),
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

type MyDoctorsRowWithId = MyDoctorsRow & { id: string }

const PAGE_SIZES = [25, 50, 100]

export default function MyDoctorsPage() {
  const navigate = useNavigate()
  const { isAdmin, isManager } = useRole()
  const canFilterByRep = isAdmin || isManager

  const [year, setYear]               = useState(CURRENT_YEAR)
  const [month, setMonth]             = useState(CURRENT_MONTH)
  const [repId, setRepId]             = useState<string | undefined>(undefined)
  const [territoryId, setTerritoryId] = useState<string | undefined>(undefined)
  const [repQuery, setRepQuery]       = useState('')
  const [pageSize, setPageSize]       = useState(25)
  const { page, goToPage, reset }     = usePagination()
  const debouncedRepQuery             = useDebounce(repQuery, 300)

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

  const { data: allRows = [], isLoading, isError, error, refetch } = useKpiMyDoctors({
    year,
    month,
    repId:       repId !== '' ? repId : undefined,
    territoryId: territoryId !== '' ? territoryId : undefined,
  })

  // Client-side pagination — DataTable handles sort internally via TanStack
  const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize))
  const safePage   = Math.min(page, totalPages - 1)
  const pagedRows  = allRows
    .slice(safePage * pageSize, safePage * pageSize + pageSize)
    .map((r) => ({ ...r, id: `${r.contactId ?? ''}-${r.territoryId ?? ''}` }))

  function handlePageSizeChange(v: string) {
    setPageSize(Number(v))
    reset()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Doctors"
        description="HCP call list by territory — specialty, class, adoption stage, and visit activity"
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
          onYearChange={(y) => { setYear(y); reset() }}
          onMonthChange={(m) => { setMonth(m); reset() }}
        />

        {/* Territory */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Territory</span>
          <div className="w-52">
            <Combobox
              value={territoryId ?? ''}
              onChange={(v) => { setTerritoryId(v !== '' ? v : undefined); reset() }}
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
                onChange={(v) => { setRepId(v !== '' ? v : undefined); reset() }}
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
              {allRows.length} doctor{allRows.length !== 1 ? 's' : ''}
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
          <div className="py-16 flex justify-center"><LoadingSpinner /></div>
        ) : isError ? (
          <div className="py-8">
            <ErrorMessage error={error} onRetry={() => refetch()} />
          </div>
        ) : (
          <>
            <DataTable
              columns={DOCTORS_COLUMNS}
              data={pagedRows}
              empty={{ icon: Users, title: 'No doctors found', description: 'Try a different period, rep, or territory.' }}
              totalElements={allRows.length}
            />
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Rows per page:</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="h-7 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((s) => (
                      <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Pagination page={safePage} totalPages={totalPages} onChange={goToPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
