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
  { header: 'Code',        accessor: 'territoryCode', sortable: true, cell: (row) => <span className="font-medium text-foreground tabular-nums">{row.territoryCode ?? '—'}</span> },
  { header: 'Name',        accessor: 'territoryName', sortable: true },
  { header: 'Region',      accessor: 'region',        sortable: true },
  { header: 'Status',      accessor: (row) => <StatusBadge status={row.status ?? 'active'} /> },
  { header: 'Primary Rep', accessor: (row) => row.primaryRepName ?? '—' },
  { header: 'Accounts',    accessor: (row) => <span className="tabular-nums">{String(row.totalAccountsCount ?? 0)}</span> },
]

export default function TerritoryListPage() {
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useTerritories(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaTerritory>(goToPage)
  const searchQuery = useTerritorySearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Territories"
        description="Manage your sales territories and assignments"
        actions={
          isManager && !isReadOnly ? (
            <Button size="sm" onClick={() => navigate('/territories/new')} className="h-8 gap-1.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New Territory
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
            placeholder="Search territories…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={TERRITORY_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'territory' : 'territories'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/territories/${row.id}`)}
          empty={isSearching
            ? { icon: MapPin, title: `No territories match "${query}"`, description: 'Try a different search term.' }
            : { icon: MapPin, title: 'No territories yet', description: 'Create your first territory to organize accounts and reps.' }
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
