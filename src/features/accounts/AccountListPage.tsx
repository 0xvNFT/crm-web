// REFERENCE PATTERN — Interns: copy this structure for your own feature list pages
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAccounts } from '@/api/endpoints/accounts'
import { usePagination } from '@/hooks/usePagination'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/formatters'
import type { PharmaAccount } from '@/api/app-types'

const columns: Column<PharmaAccount>[] = [
  { header: 'Name', accessor: (row) => row.name ?? '—' },
  { header: 'Type', accessor: (row) => row.accountType ?? '—' },
  { header: 'Phone', accessor: (row) => row.phoneMain ?? '—' },
  { header: 'Status', accessor: (row) => <StatusBadge status={row.status ?? 'UNKNOWN'} /> },
  { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
]

export default function AccountListPage() {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const { data, isLoading, isError } = useAccounts(page)

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Accounts"
        description="Manage your pharmaceutical accounts"
        actions={
          <Button size="sm" onClick={() => navigate('/accounts/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Account
          </Button>
        }
      />
      <DataTable columns={columns} data={data?.content ?? []} onRowClick={(row) => navigate(`/accounts/${row.id}`)} />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
    </div>
  )
}
