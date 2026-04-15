import { useNavigate } from 'react-router-dom'
import { Plus, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRole } from '@/hooks/useRole'
import { useInvoices, useInvoiceSearch } from '@/api/endpoints/invoices'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/ui/search-input'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PharmaInvoice } from '@/api/app-types'

const INVOICE_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'invoice.status' },
]

const FILTER_KEYS = ['status']

const columns: Column<PharmaInvoice>[] = [
  { header: 'Invoice #',    accessor: 'invoiceNumber', sortable: true, cell: (row) => <span className="font-medium text-foreground tabular-nums">{row.invoiceNumber ?? '—'}</span> },
  { header: 'Subject',      accessor: 'subject',       sortable: true },
  { header: 'Account',      accessor: (row) => row.accountName ?? '—' },
  { header: 'Status',       accessor: (row) => <StatusBadge status={row.status ?? 'draft'} /> },
  { header: 'Invoice Date', accessor: (row) => <span className="text-muted-foreground tabular-nums">{formatDate(row.invoiceDate)}</span> },
  { header: 'Due Date',     accessor: (row) => <span className="text-muted-foreground tabular-nums">{formatDate(row.dueDate)}</span> },
  { header: 'Balance Due',  accessor: (row) => <span className="tabular-nums">{formatCurrency(row.balanceDue ?? 0)}</span> },
]

export default function InvoiceListPage() {
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useInvoices(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaInvoice>(goToPage)
  const searchQuery = useInvoiceSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        description="Track and manage customer invoices"
        actions={
          isManager && !isReadOnly ? (
            <Button size="sm" onClick={() => navigate('/invoices/new')} className="h-8 gap-1.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New Invoice
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
            placeholder="Search by invoice number or subject…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={INVOICE_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'invoice' : 'invoices'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/invoices/${row.id}`)}
          empty={isSearching
            ? { icon: Receipt, title: `No invoices match "${query}"`, description: 'Try a different search term.' }
            : { icon: Receipt, title: 'No invoices yet', description: 'Invoices will appear here once created.' }
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
