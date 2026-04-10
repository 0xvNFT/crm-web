import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRole } from '@/hooks/useRole'
import { useInvoices, useInvoiceSearch } from '@/api/endpoints/invoices'
import { useListParams } from '@/hooks/useListParams'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { SearchInput } from '@/components/ui/search-input'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PharmaInvoice } from '@/api/app-types'

const INVOICE_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'invoice.status' },
]

const FILTER_KEYS = ['status']

const columns: Column<PharmaInvoice>[] = [
  { header: 'Invoice #',  accessor: 'invoiceNumber', sortable: true },
  { header: 'Subject',    accessor: 'subject',       sortable: true },
  { header: 'Account',    accessor: (row) => row.accountName ?? '—' },
  { header: 'Status',     accessor: (row) => <StatusBadge status={row.status ?? 'draft'} /> },
  { header: 'Invoice Date', accessor: (row) => formatDate(row.invoiceDate) },
  { header: 'Due Date',   accessor: (row) => formatDate(row.dueDate) },
  { header: 'Balance Due', accessor: (row) => formatCurrency(row.balanceDue ?? 0) },
]

export default function InvoiceListPage() {
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery   = useInvoices(page, 20, filters)
  const searchQuery = useInvoiceSearch(debouncedQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError   = isSearching ? searchQuery.isError   : listQuery.isError
  const error     = isSearching ? searchQuery.error     : listQuery.error
  const data: PharmaInvoice[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices"
        description="Track and manage customer invoices"
        actions={isManager && !isReadOnly ? (
          <Button size="sm" onClick={() => navigate('/invoices/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Invoice
          </Button>
        ) : undefined}
      />
      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0) }}
        placeholder="Search by invoice number or subject…"
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={INVOICE_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/invoices/${row.id}`)}
        empty={isSearching
          ? { icon: Receipt, title: `No invoices found for "${debouncedQuery}"`, description: 'Try a different search term.' }
          : { icon: Receipt, title: 'No invoices yet', description: 'Invoices will appear here once created.' }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
