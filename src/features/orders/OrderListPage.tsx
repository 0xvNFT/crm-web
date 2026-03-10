import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import { useOrders } from '@/api/endpoints/orders'
import { usePagination } from '@/hooks/usePagination'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PharmaOrder } from '@/api/app-types'

const columns: Column<PharmaOrder>[] = [
  { header: 'Order #', accessor: (row) => row.orderNumber },
  { header: 'Account', accessor: (row) => row.account?.name ?? '—' },
  {
    header: 'Status',
    accessor: (row) => <StatusBadge status={(row.status ?? '').toUpperCase()} />,
  },
  { header: 'Total', accessor: (row) => formatCurrency(row.totalAmount) },
  { header: 'Owner', accessor: (row) => row.owner?.fullName ?? '—' },
  { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
]

export default function OrderListPage() {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const [filters] = useState<Record<string, string>>({})

  const { data, isLoading, isError } = useOrders(page, 20, filters)

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

  const orders: PharmaOrder[] = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders"
        description="Manage and track pharma orders"
      />
      <DataTable
        columns={columns}
        data={orders}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        empty={{
          icon: ShoppingCart,
          title: 'No orders yet',
          description: 'Orders will appear here once created.',
        }}
        totalElements={data?.totalElements}
      />
      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
    </div>
  )
}