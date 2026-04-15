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
  { header: 'Title',         accessor: 'noteTitle',    sortable: true, cell: (row) => <span className="font-medium text-foreground">{row.noteTitle ?? '—'}</span> },
  { header: 'Rep',           accessor: 'salesRepName', cell: (row) => row.salesRepName ?? '—' },
  { header: 'Coach',         accessor: 'coachName',    cell: (row) => row.coachName ?? '—' },
  { header: 'Feedback Type', accessor: 'feedbackType', sortable: true, cell: (row) => row.feedbackType ? formatLabel(row.feedbackType) : '—' },
  { header: 'Date',          accessor: 'dateProvided', sortable: true, cell: (row) => <span className="text-muted-foreground tabular-nums">{formatDate(row.dateProvided)}</span> },
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

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Coaching Notes"
        description="Field rep coaching sessions and follow-ups"
        actions={
          isManager ? (
            <Button size="sm" onClick={() => navigate('/coaching/new')} className="h-8 gap-1.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New Note
            </Button>
          ) : undefined
        }
      />

      {/* Card surface */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by title…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={COACHING_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'note' : 'notes'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/coaching/${row.id}`)}
          empty={isSearching
            ? { icon: MessageSquare, title: `No results match "${query}"`, description: 'Try a different search term.' }
            : { icon: MessageSquare, title: 'No coaching notes yet', description: isManager ? 'Create the first coaching note.' : 'Your coaching notes will appear here.' }
          }
        />

        {/* Footer — pagination */}
        {!isSearching && totalPages > 1 && (
          <div className="border-t border-border/40 px-4">
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </div>
        )}
      </div>
    </div>
  )
}
