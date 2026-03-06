import { useNavigate } from 'react-router-dom'
import { useContacts } from '@/api/endpoints/contacts'
import { usePagination } from '@/hooks/usePagination'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatLabel } from '@/utils/formatters'
import type { PharmaContact } from '@/api/app-types'

const columns: Column<PharmaContact>[] = [
  {
    header: 'Name',
    accessor: (row) => (
      <div>
        <p className="font-medium text-foreground">
          {[row.salutation, row.firstName, row.lastName].filter(Boolean).join(' ')}
        </p>
        {row.title && <p className="text-xs text-muted-foreground">{row.title}</p>}
      </div>
    ),
  },
  { header: 'Type', accessor: (row) => formatLabel(row.contactType) },
  { header: 'Specialty', accessor: (row) => row.specialty ?? '—' },
  { header: 'Account', accessor: (row) => row.account?.name ?? '—' },
  { header: 'Mobile', accessor: (row) => row.mobile ?? row.phone ?? '—' },
  {
    header: 'Status',
    accessor: (row) => <StatusBadge status={(row.status ?? 'active').toUpperCase()} />,
  },
]

export default function ContactListPage() {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const { data, isLoading, isError } = useContacts(page)

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Contacts"
        description="Doctors, pharmacists, and healthcare professionals"
      />
      <DataTable
        columns={columns}
        data={data?.content ?? []}
        onRowClick={(row) => navigate(`/contacts/${row.id}`)}
        emptyMessage="No contacts found."
      />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
    </div>
  )
}
