import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin } from 'lucide-react'
import { useVisits, useVisitSearch } from '@/api/endpoints/visits'
import { useListParams } from '@/hooks/useListParams'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/hooks/useRole'
import { useScopedLabel } from '@/hooks/useScopedLabel'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
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
  { header: 'Visit #', accessor: 'visitNumber', sortable: true },
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
  { header: 'Account', accessor: (row) => row.accountName ?? '—' },
  {
    header: 'Rep',
    accessor: (row) => row.assignedRepName ?? '—',
  },
  {
    header: 'Status',
    accessor: (row) => <StatusBadge status={row.status ?? 'unknown'} />,
  },
  { header: 'Scheduled', accessor: (row) => formatDate(row.scheduledStart), sortable: false },
]

export default function VisitListPage() {
  const navigate = useNavigate()
  const { isRep, isManager } = useRole()
  const { title, emptyTitle, emptyDescription } = useScopedLabel('Visits')
  const columns = isManager ? ALL_COLUMNS : ALL_COLUMNS.filter((c) => c.header !== 'Rep')
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery = useVisits(page, 20, filters)
  const searchQuery = useVisitSearch(debouncedQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const error = isSearching ? searchQuery.error : listQuery.error
  const data: PharmaFieldVisit[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description="Field visit records and check-in/check-out activity"
        actions={
          isRep ? (
            <Button size="sm" onClick={() => navigate('/visits/new')}>
              <Plus className="h-4 w-4 mr-1.5" />
              Schedule Visit
            </Button>
          ) : undefined
        }
      />

      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0) }}
        placeholder="Search by visit # or subject…"
        className="max-w-sm"
      />

      {!isSearching && (
        <FilterBar
          filters={VISIT_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}

      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/visits/${row.id}`)}
        empty={
          isSearching
            ? {
                icon: MapPin,
                title: `No visits found for "${debouncedQuery}"`,
                description: 'Try a different search term.',
              }
            : {
                icon: MapPin,
                title: emptyTitle,
                description: emptyDescription,
                // action: isRep ? (
                //   <Button size="sm" onClick={() => navigate('/visits/new')}>
                //     <Plus className="h-4 w-4 mr-1.5" />
                //     Schedule Visit
                //   </Button>
                // ) : undefined,
              }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />

      {!isSearching && (
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      )}
    </div>
  )
}
