import { useNavigate } from 'react-router-dom'
import { Plus, MessageSquare } from 'lucide-react'
import { useCoachingNotes, useCoachingSearch } from '@/api/endpoints/coaching'
import { useRole } from '@/hooks/useRole'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { formatDate, formatLabel } from '@/utils/formatters'
import type { PharmaCoachingNote } from '@/api/app-types'

const COACHING_FILTERS: FilterDef[] = [
  { param: 'feedbackType', label: 'Feedback Type', configKey: 'coaching.feedbackType' },
]

const FILTER_KEYS = ['feedbackType']

const columns: Column<PharmaCoachingNote>[] = [
  { header: 'Title',         accessor: 'noteTitle',    sortable: true, cell: (row) => row.noteTitle ?? '—' },
  { header: 'Rep',           accessor: 'salesRepName', cell: (row) => row.salesRepName ?? '—' },
  { header: 'Coach',         accessor: 'coachName',    cell: (row) => row.coachName ?? '—' },
  { header: 'Feedback Type', accessor: 'feedbackType', sortable: true, cell: (row) => row.feedbackType ? formatLabel(row.feedbackType) : '—' },
  { header: 'Date',          accessor: 'dateProvided', sortable: true, cell: (row) => formatDate(row.dateProvided) },
  {
    header: 'Follow-up',
    accessor: (row) => {
      if (!row.followUpRequired) return '—'
      if (row.followUpCompleted) return 'Done'
      return row.followUpDate ? formatDate(row.followUpDate) : 'Pending'
    },
  },
]

export default function CoachingListPage() {
  const navigate = useNavigate()
  const { isManager } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useCoachingNotes(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaCoachingNote>(goToPage)
  const searchQuery = useCoachingSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Coaching Notes"
        description="Field rep coaching sessions and follow-ups"
        actions={
          isManager ? (
            <Button size="sm" onClick={() => navigate('/coaching/new')}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Note
            </Button>
          ) : undefined
        }
      />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by title…"
        className="max-w-sm"
      />

      {!isSearching && (
        <FilterBar
          filters={COACHING_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}

      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/coaching/${row.id}`)}
        empty={
          isSearching
            ? { icon: MessageSquare, title: `No results for "${query}"`, description: 'Try a different search term.' }
            : { icon: MessageSquare, title: 'No coaching notes yet', description: isManager ? 'Create the first coaching note.' : 'Your coaching notes will appear here.' }
        }
        totalElements={totalElements}
      />

      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
