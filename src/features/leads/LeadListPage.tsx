import { useLeads } from '@/api/endpoints/leads'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { usePagination } from '@/hooks/usePagination'
import { formatDate } from '@/utils/formatters'
import type { PharmaLead } from '@/api/app-types'
import type { Column } from '@/components/shared/DataTable'

export default function LeadListPage() {
  const { page, goToPage } = usePagination()

  const { data, isLoading, isError } = useLeads(page)

  const columns: Column<PharmaLead>[] = [
    { header: 'Lead Name', accessor: (row) => `${row.firstName ?? ''} ${row.lastName}`.trim() },
    { header: 'Company', accessor: (row) => row.companyName },
    { header: 'Status', accessor: (row) => <StatusBadge status={row.leadStatus ?? 'UNKNOWN'} /> },
    { header: 'Rating', accessor: (row) => row.rating },
    { header: 'Owner', accessor: (row) => row.assignedUser?.fullName },
    { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Potential customers and prospects"
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorMessage />
      ) : (
        <>
          <DataTable columns={columns} data={data?.content ?? []} />
          <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
        </>
      )}
    </div>
  )
}