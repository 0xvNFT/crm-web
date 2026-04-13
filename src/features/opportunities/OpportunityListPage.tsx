import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp } from 'lucide-react'
import { useOpportunities, useOpportunitySearch } from '@/api/endpoints/opportunities'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { useRole } from '@/hooks/useRole'
import { useScopedLabel } from '@/hooks/useScopedLabel'
import { formatDate, formatCurrency, formatLabel } from '@/utils/formatters'
import type { PharmaOpportunity } from '@/api/app-types'

const OPPORTUNITY_FILTERS: FilterDef[] = [
  { param: 'status',      label: 'Status',    configKey: 'opportunity.status' },
  { param: 'salesStage',  label: 'Stage',     configKey: 'opportunity.salesStage' },
]

const FILTER_KEYS = ['status', 'salesStage']

const ALL_COLUMNS: Column<PharmaOpportunity>[] = [
  { header: 'Topic',    accessor: 'topic', sortable: true },
  { header: 'Account',  accessor: (row) => row.accountName ?? '—' },
  { header: 'Stage',    accessor: (row) => row.salesStage ? formatLabel(row.salesStage) : '—' },
  { header: 'Status',   accessor: (row) => row.status ? <StatusBadge status={row.status} /> : '—' },
  { header: 'Revenue',  accessor: (row) => row.estRevenue != null ? formatCurrency(row.estRevenue) : '—' },
  { header: 'Close',    accessor: (row) => formatDate(row.estCloseDate), sortable: false },
  { header: 'Owner',    accessor: (row) => row.ownerName ?? '—' },
]

export default function OpportunityListPage() {
  const navigate = useNavigate()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const { isReadOnly, isManager } = useRole()
  const { title, emptyTitle, emptyDescription } = useScopedLabel('Opportunities')
  const columns = isManager ? ALL_COLUMNS : ALL_COLUMNS.filter((c) => c.header !== 'Owner')

  const listQuery   = useOpportunities(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaOpportunity>(goToPage)
  const searchQuery = useOpportunitySearch(debouncedQuery)

  const { isLoading, isError, error, data: opportunities, totalPages, totalElements } = resolve(listQuery, searchQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description="Track your pipeline and close deals"
        actions={
          !isReadOnly ? (
            <Button size="sm" onClick={() => navigate('/opportunities/new')}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Opportunity
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search opportunities…"
          className="max-w-sm"
        />
        {!isSearching && (
          <FilterBar
            filters={OPPORTUNITY_FILTERS}
            values={filters}
            onChange={handleFilterChange}
            onClear={handleFilterClear}
          />
        )}
      </div>

      <DataTable
        columns={columns}
        data={opportunities}
        onRowClick={(row) => navigate(`/opportunities/${row.id}`)}
        empty={isSearching
          ? { icon: TrendingUp, title: `No opportunities found for "${query}"`, description: 'Try a different search term.' }
          : { icon: TrendingUp, title: emptyTitle, description: emptyDescription }
        }
        totalElements={totalElements}
      />

      {!isSearching && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={goToPage}
        />
      )}
    </div>
  )
}
