import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus } from 'lucide-react'
import { useOrders, useOrderSearch } from '@/api/endpoints/orders'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { useRole } from '@/hooks/useRole'
import { useScopedLabel } from '@/hooks/useScopedLabel'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PharmaOrder } from '@/api/app-types'

const ORDER_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'order.status' },
]

const FILTER_KEYS = ['status']

const ALL_COLUMNS: Column<PharmaOrder>[] = [
  { header: 'Order #',  accessor: 'orderNumber',  sortable: true, cell: (row) => <span className="font-medium text-foreground tabular-nums">{row.orderNumber ?? '—'}</span> },
  { header: 'Account',  accessor: (row) => row.accountName ?? '—' },
  { header: 'Status',   accessor: (row) => <StatusBadge status={row.status ?? 'unknown'} /> },
  { header: 'Total',    accessor: (row) => <span className="tabular-nums">{formatCurrency(row.totalAmount ?? 0)}</span> },
  { header: 'Owner',    accessor: (row) => row.createdByName ?? '—' },
  { header: 'Created',  accessor: (row) => <span className="text-muted-foreground tabular-nums">{formatDate(row.createdAt)}</span> },
]

export default function OrderListPage() {
  const navigate = useNavigate()
  const { isReadOnly, isManager } = useRole()
  const { title, emptyTitle, emptyDescription } = useScopedLabel('Orders')
  const columns = isManager ? ALL_COLUMNS : ALL_COLUMNS.filter((c) => c.header !== 'Owner')
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useOrders(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaOrder>(goToPage)
  const searchQuery = useOrderSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description="Manage your pharmaceutical orders"
        actions={
          !isReadOnly ? (
            <Button size="sm" onClick={() => navigate('/orders/new')} className="h-8 gap-1.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New Order
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
            placeholder="Search by order number…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={ORDER_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'order' : 'orders'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/orders/${row.id}`)}
          empty={isSearching
            ? { icon: ShoppingCart, title: `No orders match "${query}"`, description: 'Try a different search term.' }
            : { icon: ShoppingCart, title: emptyTitle, description: emptyDescription }
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
