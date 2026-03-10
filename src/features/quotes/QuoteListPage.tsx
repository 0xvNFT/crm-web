import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useQuotes } from '@/api/endpoints/quotes'
import { usePagination } from '@/hooks/usePagination'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { formatDate, formatCurrency } from '@/utils/formatters'
import type { PharmaQuote } from '@/api/app-types'

const QUOTE_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'quote.status' },
]

const columns: Column<PharmaQuote>[] = [
  {
    header: 'Quote #',
    accessor: (row) => <p className="font-medium text-foreground">{row.quoteNumber ?? '—'}</p>,
  },
  { header: 'Account', accessor: (row) => row.account?.name ?? '—' },
  {
    header: 'Status',
    accessor: (row) => <StatusBadge status={(row.status ?? '').toUpperCase()} />,
  },
  {
    header: 'Total',
    accessor: (row) => row.totalAmount != null ? formatCurrency(row.totalAmount) : '—',
  },
  { header: 'Valid From', accessor: (row) => formatDate(row.validFrom) },
  { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
]

export default function QuoteListPage() {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const [filters, setFilters] = useState<Record<string, string>>({})

  const { data, isLoading, isError } = useQuotes(page, 20, filters)

  function handleFilterChange(param: string, value: string) {
    setFilters((prev) => ({ ...prev, [param]: value }))
    goToPage(0)
  }

  function handleFilterClear() {
    setFilters({})
    goToPage(0)
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quotes"
        description="Sales quotes and proposals"
      />
      <FilterBar
        filters={QUOTE_FILTERS}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleFilterClear}
      />
      <DataTable
        columns={columns}
        data={data?.content ?? []}
        onRowClick={(row) => navigate(`/quotes/${row.id}`)}
        empty={{
          icon: FileText,
          title: 'No quotes yet',
          description: 'Quotes will appear here once created.',
        }}
        totalElements={data?.totalElements}
      />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
    </div>
  )
}