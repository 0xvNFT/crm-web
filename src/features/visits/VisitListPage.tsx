import { useNavigate } from 'react-router-dom'
import { Plus, MapPin } from 'lucide-react'
import { useVisits, useVisitSearch } from '@/api/endpoints/visits'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { useRole } from '@/hooks/useRole'
import { useScopedLabel } from '@/hooks/useScopedLabel'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { formatDate } from '@/utils/formatters'
import type { PharmaFieldVisit } from '@/api/app-types'

const VISIT_FILTERS: FilterDef[] = [
  { param: 'visitType', label: 'Visit Type', configKey: 'visit.type' },
  { param: 'status', label: 'Status', configKey: 'visit.status' },
]

const FILTER_KEYS = ['visitType', 'status']

const ALL_COLUMNS: Column<PharmaFieldVisit>[] = [
  { header: 'Visit #',   accessor: 'visitNumber', sortable: true, cell: (row) => <span className="font-medium text-foreground tabular-nums">{row.visitNumber ?? '—'}</span> },
  {
    header: 'Subject',
    accessor: (row) => (
      <div>
        <p className="font-medium text-foreground">{row.subject ?? '—'}</p>
        {row.visitType && (
          <p className="text-xs text-muted-foreground capitalize">{row.visitType.replace(/_/g, ' ')}</p>
        )}
      </div>
    ),
  },
  { header: 'Account',   accessor: (row) => row.accountName ?? '—' },
  { header: 'Rep',       accessor: (row) => row.assignedRepName ?? '—' },
  { header: 'Status',    accessor: (row) => <StatusBadge status={row.status ?? 'unknown'} /> },
  { header: 'Scheduled', accessor: (row) => <span className="text-muted-foreground tabular-nums">{formatDate(row.scheduledStart)}</span> },
]

export default function VisitListPage() {
  const navigate = useNavigate()
  const { isRep, isManager } = useRole()
  const { title, emptyTitle, emptyDescription } = useScopedLabel('Visits')
  const columns = isManager ? ALL_COLUMNS : ALL_COLUMNS.filter((c) => c.header !== 'Rep')
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useVisits(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaFieldVisit>(goToPage)
  const searchQuery = useVisitSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description="Field visit records and check-in/check-out activity"
        actions={
          isRep ? (
            <Button size="sm" onClick={() => navigate('/visits/new')} className="h-8 gap-1.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Schedule Visit
            </Button>
          ) : undefined
        }
      />

      {/* Card surface */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by visit # or subject…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={VISIT_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'visit' : 'visits'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/visits/${row.id}`)}
          empty={isSearching
            ? { icon: MapPin, title: `No visits match "${query}"`, description: 'Try a different search term.' }
            : { icon: MapPin, title: emptyTitle, description: emptyDescription }
          }
        />

        {/* Footer — pagination */}
        {!isSearching && totalPages > 1 && (
          <div className="border-t border-border/40 px-4">
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </div>
        )}
      </div>
    </div>
  )
}
