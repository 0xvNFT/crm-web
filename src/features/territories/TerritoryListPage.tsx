import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MapPin } from 'lucide-react'
import { useTerritories, useTerritorySearch } from '@/api/endpoints/territories'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/hooks/useRole'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import type { PharmaTerritory } from '@/api/app-types'

const columns: Column<PharmaTerritory>[] = [
  { header: 'Code', accessor: 'territoryCode', sortable: true },
  { header: 'Name', accessor: 'territoryName', sortable: true },
  { header: 'Region', accessor: 'region', sortable: true },
  {
    header: 'Status',
    accessor: (row) => (
      <StatusBadge status={(row.status ?? 'active').toUpperCase()} />
    ),
  },
  {
    header: 'Primary Rep',
    accessor: (row) => row.primaryRep?.fullName ?? '—',
  },
  {
    header: 'Accounts',
    accessor: (row) => String(row.totalAccountsCount ?? 0),
  },
]

export default function TerritoryListPage() {
  const navigate = useNavigate()
  const { isManager } = useRole()
  const { page, goToPage } = usePagination()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery = useTerritories(page)
  const searchQuery = useTerritorySearch(debouncedQuery)

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const data: PharmaTerritory[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

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
