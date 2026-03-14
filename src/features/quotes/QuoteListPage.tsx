import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useQuotes, useQuoteSearch } from '@/api/endpoints/quotes'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
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

const columns: Column<PharmaQuote>[] = [
  { header: 'Quote #', accessor: (row) => row.quoteNumber ?? '—' },
  { header: 'Account', accessor: (row) => row.account?.name ?? '—' },
  {
    header: 'Status',
    accessor: (row) => row.status ? <StatusBadge status={row.status} /> : '—',
  },
  {
    header: 'Total',
    accessor: (row) => row.totalAmount != null ? formatCurrency(row.totalAmount) : '—',
  },
  { header: 'Valid From', accessor: (row) => row.validFrom ? formatDate(row.validFrom) : '—' },
  { header: 'Created', accessor: (row) => row.createdAt ? formatDate(row.createdAt) : '—' },
]

export default function QuoteListPage() {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [filters, setFilters] = useState<Record<string, string>>({})

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery = useQuotes(page, 20, filters)
  const searchQuery = useQuoteSearch(debouncedQuery)

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
  const data: PharmaQuote[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quotes"
        description="Sales quotes and proposals"
        actions={<Button onClick={() => navigate('/quotes/new')}>New Quote</Button>}
      />
      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0) }}
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
          ? { icon: FileText, title: `No quotes found for "${debouncedQuery}"`, description: 'Try a different search term.' }
          : { icon: FileText, title: 'No quotes yet', description: 'Quotes will appear here once created.' }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
