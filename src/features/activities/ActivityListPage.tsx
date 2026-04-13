import { useNavigate } from 'react-router-dom'
import { Plus, Calendar } from 'lucide-react'
import { useActivities, useActivitySearch } from '@/api/endpoints/activities'
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
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { formatLabel, formatDate } from '@/utils/formatters'
import type { PharmaActivity } from '@/api/app-types'

// fields present in API response but missing from generated spec — remove when spec is updated
interface ActivityRow extends PharmaActivity {
  dueDate?: string
  durationMinutes?: number
  followUpRequired?: boolean
}

const ACTIVITY_FILTERS: FilterDef[] = [
  { param: 'activityType', label: 'Type', configKey: 'activity.type' },
  { param: 'status', label: 'Status', configKey: 'activity.status' },
]

const FILTER_KEYS = ['activityType', 'status']

const ALL_COLUMNS: Column<ActivityRow>[] = [
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
    accessor: (row) => <StatusBadge status={row.status ?? 'unknown'} />,
  },
  {
    header: 'Assigned To',
    accessor: (row) => row.assignedUserName ?? '—',
  },
  {
    header: 'Due Date',
    accessor: (row) => (row.dueDate ? formatDate(row.dueDate) : '—'),
  },
  {
    header: 'Duration',
    accessor: (row) => (row.durationMinutes != null ? `${row.durationMinutes} min` : '—'),
  },
  {
    header: 'Follow-up',
    accessor: (row) => (row.followUpRequired ? 'Yes' : 'No'),
  },
]

export default function ActivityListPage() {
  const navigate = useNavigate()
  const { isReadOnly, isManager } = useRole()
  const { title, emptyTitle, emptyDescription } = useScopedLabel('Activities')
  const columns = isManager ? ALL_COLUMNS : ALL_COLUMNS.filter((c) => c.header !== 'Assigned To')
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useActivities(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<ActivityRow>(goToPage)
  const searchQuery = useActivitySearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title={title}
        description="Manage pharma activities, calls, and meetings"
        actions={!isReadOnly ? (
          <Button size="sm" onClick={() => navigate('/activities/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Activity
          </Button>
        ) : undefined}
      />
      
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search activities..."
        className="max-w-sm"
      />
      
      {!isSearching && (
        <FilterBar
          filters={ACTIVITY_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/activities/${row.id}`)}
        empty={isSearching
          ? { icon: Calendar, title: `No activities found for "${query}"`, description: 'Try a different search term.' }
          : { icon: Calendar, title: emptyTitle, description: emptyDescription }
        }
        totalElements={totalElements}
      />
      
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
