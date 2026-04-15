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
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide',
        isActive
          ? 'bg-green-50 text-green-700 border-green-200/80'
          : 'bg-red-50 text-red-700 border-red-200/80'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', isActive ? 'bg-green-500' : 'bg-red-500')} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

const columns: Column<PharmaTeam>[] = [
  { header: 'Name',          accessor: 'name',              sortable: true, cell: (row) => <span className="font-medium text-foreground">{row.name ?? '—'}</span> },
  { header: 'Type',          accessor: (row) => row.teamType ?? '—' },
  { header: 'Administrator', accessor: (row) => row.administratorName ?? '—' },
  { header: 'Email',         accessor: (row) => <span className="text-muted-foreground">{row.emailAddress ?? '—'}</span> },
  { header: 'Status',        accessor: (row) => <ActiveBadge isActive={row.isActive} /> },
]

export default function TeamListPage() {
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useTeams(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaTeam>(goToPage)
  const searchQuery = useTeamSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Teams"
        description="Manage your field force teams"
        actions={
          isManager && !isReadOnly ? (
            <Button size="sm" onClick={() => navigate('/teams/new')} className="h-8 gap-1.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New Team
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
            placeholder="Search teams…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={TEAM_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'team' : 'teams'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/teams/${row.id}`)}
          empty={isSearching
            ? { icon: Users2, title: `No teams match "${query}"`, description: 'Try a different search term.' }
            : { icon: Users2, title: 'No teams yet', description: 'Create your first team to organize your field reps.' }
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
