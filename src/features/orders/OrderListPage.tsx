import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus } from 'lucide-react'
import { useOrders, useOrderSearch } from '@/api/endpoints/orders'
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
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PharmaOrder } from '@/api/app-types'

const ORDER_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'order.status' },
]

const FILTER_KEYS = ['status']

const columns: Column<PharmaOrder>[] = [
  { header: 'Order #',  accessor: 'orderNumber',  sortable: true, cell: (row) => row.orderNumber ?? '—' },
  { header: 'Account',  accessor: (row) => row.accountName ?? '—' },
  { header: 'Status',   accessor: (row) => <StatusBadge status={row.status ?? 'UNKNOWN'} /> },
  { header: 'Total',    accessor: (row) => formatCurrency(row.totalAmount ?? 0) },
  { header: 'Owner',    accessor: (row) => row.createdByName ?? '—' },
  { header: 'Created',  accessor: (row) => formatDate(row.createdAt) },
]

export default function OrderListPage() {
  const navigate = useNavigate()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery   = useOrders(page, 20, filters)
  const searchQuery = useOrderSearch(debouncedQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  const isLoading  = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError    = isSearching ? searchQuery.isError   : listQuery.isError
  const error      = isSearching ? searchQuery.error     : listQuery.error
  const data: PharmaOrder[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders"
        description="Manage your pharmaceutical orders"
        actions={
          <Button onClick={() => navigate('/orders/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        }
      />
      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0) }}
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
          ? { icon: ShoppingCart, title: `No orders found for "${debouncedQuery}"`, description: 'Try a different search term.' }
          : { icon: ShoppingCart, title: 'No orders yet', description: 'Orders will appear here once created.' }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}