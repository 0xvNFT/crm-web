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
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PharmaOrder } from '@/api/app-types'

const ORDER_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'order.status' },
]

const FILTER_KEYS = ['status']

const ALL_COLUMNS: Column<PharmaOrder>[] = [
  { header: 'Order #',  accessor: 'orderNumber',  sortable: true, cell: (row) => row.orderNumber ?? '—' },
  { header: 'Account',  accessor: (row) => row.accountName ?? '—' },
  { header: 'Status',   accessor: (row) => <StatusBadge status={row.status ?? 'unknown'} /> },
  { header: 'Total',    accessor: (row) => formatCurrency(row.totalAmount ?? 0) },
  { header: 'Owner',    accessor: (row) => row.createdByName ?? '—' },
  { header: 'Created',  accessor: (row) => formatDate(row.createdAt) },
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

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description="Manage your pharmaceutical orders"
        actions={
          !isReadOnly ? (
            <Button onClick={() => navigate('/orders/new')}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Order
            </Button>
          ) : undefined
        }
      />
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by order number…"
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={ORDER_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        empty={isSearching
          ? { icon: ShoppingCart, title: `No orders found for "${query}"`, description: 'Try a different search term.' }
          : { icon: ShoppingCart, title: emptyTitle, description: emptyDescription }
        }
        totalElements={totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}