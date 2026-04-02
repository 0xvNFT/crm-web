import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar } from 'lucide-react'
import { useActivities, useActivitySearch } from '@/api/endpoints/activities'
import { useListParams } from '@/hooks/useListParams'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/hooks/useRole'
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

const columns: Column<ActivityRow>[] = [
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
    accessor: (row) => <StatusBadge status={row.status ?? 'UNKNOWN'} />,
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
  const { isReadOnly } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery = useActivities(page, 20, filters)
  const searchQuery = useActivitySearch(debouncedQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const error = isSearching ? searchQuery.error : listQuery.error

  // Fix 3: Removed type cast, used typed variable declaration
  const data: ActivityRow[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
    
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Activities"
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
        onChange={(v) => { setQuery(v); goToPage(0) }}
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
          ? { icon: Calendar, title: `No activities found for "${debouncedQuery}"`, description: 'Try a different search term.' }
          : { icon: Calendar, title: 'No activities yet', description: 'No activities have been recorded yet.' }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />
      
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
