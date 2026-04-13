import { useNavigate } from 'react-router-dom'
import { Plus, Users2 } from 'lucide-react'
import { useTeams, useTeamSearch } from '@/api/endpoints/teams'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { useRole } from '@/hooks/useRole'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { cn } from '@/lib/utils'
import type { PharmaTeam } from '@/api/app-types'

const TEAM_FILTERS: FilterDef[] = [
  { param: 'teamType', label: 'Type', configKey: 'team.type' },
]

const FILTER_KEYS = ['teamType']

function ActiveBadge({ isActive }: { isActive?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        isActive
          ? 'bg-green-100 text-green-800 border-green-200'
          : 'bg-red-100 text-red-800 border-red-200'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

const columns: Column<PharmaTeam>[] = [
  { header: 'Name', accessor: 'name', sortable: true },
  { header: 'Type', accessor: (row) => row.teamType ?? '—' },
  { header: 'Administrator', accessor: (row) => row.administratorName ?? '—' },
  { header: 'Email', accessor: (row) => row.emailAddress ?? '—' },
  { header: 'Status', accessor: (row) => <ActiveBadge isActive={row.isActive} /> },
]

export default function TeamListPage() {
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useTeams(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaTeam>(goToPage)
  const searchQuery = useTeamSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Teams"
        description="Manage your field force teams"
        actions={
          isManager && !isReadOnly ? (
            <Button size="sm" onClick={() => navigate('/teams/new')}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Team
            </Button>
          ) : undefined
        }
      />
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search teams…"
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={TEAM_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/teams/${row.id}`)}
        empty={
          isSearching
            ? { icon: Users2, title: `No teams found for "${query}"`, description: 'Try a different search term.' }
            : { icon: Users2, title: 'No teams yet', description: 'Create your first team to organize your field reps.' }
        }
        totalElements={totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
