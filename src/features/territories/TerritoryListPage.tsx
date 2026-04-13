import { useNavigate } from 'react-router-dom'
import { Plus, MapPin } from 'lucide-react'
import { useTerritories, useTerritorySearch } from '@/api/endpoints/territories'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { useRole } from '@/hooks/useRole'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import type { PharmaTerritory } from '@/api/app-types'

const TERRITORY_FILTERS: FilterDef[] = [
  { param: 'region', label: 'Region', configKey: 'territory.region' },
  { param: 'status', label: 'Status', configKey: 'territory.status' },
]

const FILTER_KEYS = ['region', 'status']

const columns: Column<PharmaTerritory>[] = [
  { header: 'Code', accessor: 'territoryCode', sortable: true },
  { header: 'Name', accessor: 'territoryName', sortable: true },
  { header: 'Region', accessor: 'region', sortable: true },
  {
    header: 'Status',
    accessor: (row) => (
      <StatusBadge status={row.status ?? 'active'} />
    ),
  },
  {
    header: 'Primary Rep',
    accessor: (row) => row.primaryRepName ?? '—',
  },
  {
    header: 'Accounts',
    accessor: (row) => String(row.totalAccountsCount ?? 0),
  },
]

export default function TerritoryListPage() {
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useTerritories(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaTerritory>(goToPage)
  const searchQuery = useTerritorySearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Territories"
        description="Manage your sales territories and assignments"
        actions={
          isManager && !isReadOnly ? (
            <Button size="sm" onClick={() => navigate('/territories/new')}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Territory
            </Button>
          ) : undefined
        }
      />
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search territories…"
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={TERRITORY_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/territories/${row.id}`)}
        empty={
          isSearching
            ? { icon: MapPin, title: `No territories found for "${query}"`, description: 'Try a different search term.' }
            : { icon: MapPin, title: 'No territories yet', description: 'Create your first territory to organize accounts and reps.' }
        }
        totalElements={totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
