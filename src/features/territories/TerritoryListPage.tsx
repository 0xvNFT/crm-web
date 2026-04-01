import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin } from 'lucide-react'
import { useTerritories, useTerritorySearch } from '@/api/endpoints/territories'
import { useListParams } from '@/hooks/useListParams'
import { useDebounce } from '@/hooks/useDebounce'
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
  const { isManager } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery = useTerritories(page, 20, filters)
  const searchQuery = useTerritorySearch(debouncedQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const error = isSearching ? searchQuery.error : listQuery.error
  const data: PharmaTerritory[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Territories"
        description="Manage your sales territories and assignments"
        actions={
          isManager ? (
            <Button size="sm" onClick={() => navigate('/territories/new')}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Territory
            </Button>
          ) : undefined
        }
      />
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v)
          goToPage(0)
        }}
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
            ? {
                icon: MapPin,
                title: `No territories found for "${debouncedQuery}"`,
                description: 'Try a different search term.',
              }
            : {
                icon: MapPin,
                title: 'No territories yet',
                description: 'Create your first territory to organize accounts and reps.',
                // action: isManager ? (
                //   <Button size="sm" onClick={() => navigate('/territories/new')}>
                //     <Plus className="h-4 w-4 mr-1.5" />
                //     New Territory
                //   </Button>
                // ) : undefined,
              }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
