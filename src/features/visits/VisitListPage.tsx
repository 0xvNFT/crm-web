import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin } from 'lucide-react'
import { useVisits, useVisitSearch } from '@/api/endpoints/visits'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/hooks/useRole'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
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

const columns: Column<PharmaFieldVisit>[] = [
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
  { header: 'Account', accessor: (row) => row.account?.name ?? '—' },
  {
    header: 'Rep',
    accessor: (row) => (row.assignedRep as { fullName?: string } | undefined)?.fullName ?? '—',
  },
  {
    header: 'Status',
    accessor: (row) => <StatusBadge status={(row.status ?? 'UNKNOWN').toUpperCase()} />,
  },
  { header: 'Scheduled', accessor: (row) => formatDate(row.scheduledStart), sortable: false },
]

export default function VisitListPage() {
  const navigate = useNavigate()
  const { isRep } = useRole()
  const { page, goToPage } = usePagination()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery = useVisits(page, 20, filters)
  const searchQuery = useVisitSearch(debouncedQuery)

  function handleFilterChange(param: string, value: string) {
    setFilters((prev) => ({ ...prev, [param]: value }))
    goToPage(0)
  }

  function handleFilterClear() {
    setFilters({})
    goToPage(0)
  }

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const data: PharmaFieldVisit[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Visits"
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
                title: 'No visits yet',
                description: 'Schedule your first field visit to get started.',
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
