import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useQuotes, useQuoteSearch } from '@/api/endpoints/quotes'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { useRole } from '@/hooks/useRole'
import { useScopedLabel } from '@/hooks/useScopedLabel'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/utils/formatters'
import type { PharmaQuote } from '@/api/app-types'

const QUOTE_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'quote.status' },
]

const FILTER_KEYS = ['status']

const ALL_COLUMNS: Column<PharmaQuote>[] = [
  { header: 'Quote #', accessor: (row) => row.quoteNumber ?? '—' },
  { header: 'Account', accessor: (row) => row.accountName ?? '—' },
  {
    header: 'Status',
    accessor: (row) => row.status ? <StatusBadge status={row.status} /> : '—',
  },
  {
    header: 'Total',
    accessor: (row) => row.totalAmount != null ? formatCurrency(row.totalAmount) : '—',
  },
  { header: 'Assigned Rep', accessor: (row) => row.assignedRepName ?? '—' },
  { header: 'Valid From', accessor: (row) => row.validFrom ? formatDate(row.validFrom) : '—' },
  { header: 'Created', accessor: (row) => row.createdAt ? formatDate(row.createdAt) : '—' },
]

export default function QuoteListPage() {
  const navigate = useNavigate()
  const { isManager } = useRole()
  const { title, emptyTitle, emptyDescription } = useScopedLabel('Quotes')
  const columns = isManager ? ALL_COLUMNS : ALL_COLUMNS.filter((c) => c.header !== 'Assigned Rep')
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useQuotes(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaQuote>(goToPage)
  const searchQuery = useQuoteSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description="Sales quotes and proposals"
        actions={<Button onClick={() => navigate('/quotes/new')}>New Quote</Button>}
      />
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search quotes..."
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={QUOTE_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/quotes/${row.id}`)}
        empty={isSearching
          ? { icon: FileText, title: `No quotes found for "${query}"`, description: 'Try a different search term.' }
          : { icon: FileText, title: emptyTitle, description: emptyDescription }
        }
        totalElements={totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
