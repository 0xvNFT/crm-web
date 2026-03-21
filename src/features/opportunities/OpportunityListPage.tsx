import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, TrendingUp } from 'lucide-react'
import { useOpportunities, useOpportunitySearch } from '@/api/endpoints/opportunities'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { useRole } from '@/hooks/useRole'
import { formatDate, formatCurrency, formatLabel } from '@/utils/formatters'
import type { PharmaOpportunity } from '@/api/app-types'

const OPPORTUNITY_FILTERS: FilterDef[] = [
  { param: 'status',      label: 'Status',    configKey: 'opportunity.status' },
  { param: 'salesStage',  label: 'Stage',     configKey: 'opportunity.salesStage' },
]

const columns: Column<PharmaOpportunity>[] = [
  { header: 'Topic',    accessor: 'topic', sortable: true },
  { header: 'Account',  accessor: (row) => row.account?.name ?? '—' },
  { header: 'Stage',    accessor: (row) => row.salesStage ? formatLabel(row.salesStage) : '—' },
  { header: 'Status',   accessor: (row) => row.status ? <StatusBadge status={row.status.toUpperCase()} /> : '—' },
  { header: 'Revenue',  accessor: (row) => row.estRevenue != null ? formatCurrency(row.estRevenue) : '—' },
  { header: 'Close',    accessor: (row) => formatDate(row.estCloseDate), sortable: false },
  { header: 'Owner',    accessor: (row) => row.owner?.fullName ?? '—' },
]

export default function OpportunityListPage() {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const { isManager } = useRole()

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery   = useOpportunities(page, 20, filters)
  const searchQuery = useOpportunitySearch(debouncedQuery)

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError   = isSearching ? searchQuery.isError   : listQuery.isError
  const error     = isSearching ? searchQuery.error     : listQuery.error
  const opportunities: PharmaOpportunity[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])

  function handleFilterChange(param: string, value: string) {
    setFilters((prev) => ({ ...prev, [param]: value }))
    goToPage(0)
  }

  function handleFilterClear() {
    setFilters({})
    goToPage(0)
  }

  if (isLoading && !isSearching) return <LoadingSpinner />
  if (isError) return <ErrorMessage error={error} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Opportunities"
        description="Track your pipeline and close deals"
        actions={
          isManager ? (
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
          onChange={(v) => { setQuery(v); goToPage(0) }}
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
        empty={{
          icon: TrendingUp,
          title: isSearching ? `No opportunities found for "${debouncedQuery}"` : 'No opportunities yet',
          description: isSearching ? undefined : 'Create your first opportunity to start tracking pipeline.',
          // action: isManager ? (
          //   <Button size="sm" onClick={() => navigate('/opportunities/new')}>
          //     <Plus className="h-4 w-4 mr-1.5" />
          //     New Opportunity
          //   </Button>
          // ) : undefined,
        }}
      />

      {!isSearching && (
        <Pagination
          page={page}
          totalPages={listQuery.data?.totalPages ?? 0}
          onChange={goToPage}
        />
      )}
    </div>
  )
}
