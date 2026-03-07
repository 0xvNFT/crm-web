import { useNavigate } from 'react-router-dom'
import { useActivities } from '@/api/endpoints/activities'
import { usePagination } from '@/hooks/usePagination'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatLabel, formatDateTime } from '@/utils/formatters'
import type { PharmaActivity } from '@/api/app-types'

// Extended type to handle fields that exist in the API but are currently missing from app-types.ts
type ActivityRow = PharmaActivity & {
  scheduledAt?: string
  durationMinutes?: number
  followUpRequired?: boolean
}

export const columns: Column<ActivityRow>[] = [
  {
    header: 'Subject',
    accessor: (row) => (
      <div>
        <p className="font-medium text-foreground">{row.subject}</p>
        {row.activityType && (
          <p className="text-xs text-muted-foreground">
            {formatLabel(row.activityType)}
          </p>
        )}
      </div>
    ),
  },
  {
    header: 'Status',
    accessor: (row) => <StatusBadge status={(row.status ?? 'active').toUpperCase()} />,
  },
  {
    header: 'Scheduled At',
    accessor: (row) => (row.scheduledAt ? formatDateTime(row.scheduledAt) : '—'),
  },
  {
    header: 'Duration',
    accessor: (row) => (row.durationMinutes != null ? `${row.durationMinutes} min` : '—'),
  },
  {
    header: 'Follow-up Required',
    accessor: (row) => (row.followUpRequired ? 'Yes' : 'No'),
  },
]

export default function ActivityListPage() {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const { data, isLoading, isError } = useActivities(page)

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Activities"
        description="Manage pharma activities, calls, and meetings"
      />
      <DataTable
        columns={columns}
        // Type assertion needed because local PharmaActivity is missing API fields
        data={(data?.content ?? []) as ActivityRow[]}
        onRowClick={(row) => navigate(`/activities/${row.id}`)}
        emptyMessage="No activities found."
      />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
    </div>
  )
}