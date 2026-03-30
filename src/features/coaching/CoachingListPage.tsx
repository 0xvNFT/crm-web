import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, AlertCircle } from 'lucide-react'
import { useCoachingNotes, useCoachingSearch } from '@/api/endpoints/coaching'
import { useRole } from '@/hooks/useRole'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTable } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { formatDate, formatLabel } from '@/utils/formatters'
import type { PharmaCoachingNote } from '@/api/app-types'

export default function CoachingListPage() {
  const navigate = useNavigate()
  const { isManager } = useRole()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const isSearching = debouncedQuery.trim().length >= 2

  const { page, goToPage } = usePagination()
  const { data: listData } = useCoachingNotes(page)
  const { data: searchResults } = useCoachingSearch(debouncedQuery)

  const notes: PharmaCoachingNote[] = isSearching
    ? (searchResults ?? [])
    : (listData?.content ?? [])
  const totalPages = isSearching ? 0 : (listData?.totalPages ?? 0)

  const columns = [
    {
      header: 'Title',
      accessor: 'noteTitle' as keyof PharmaCoachingNote,
      cell: (row: PharmaCoachingNote) => row.noteTitle ?? '—',
    },
    {
      header: 'Rep',
      accessor: (row: PharmaCoachingNote) => row.salesRepName ?? '—',
    },
    {
      header: 'Coach',
      accessor: (row: PharmaCoachingNote) => row.coachName ?? '—',
    },
    {
      header: 'Feedback Type',
      accessor: 'feedbackType' as keyof PharmaCoachingNote,
      cell: (row: PharmaCoachingNote) => row.feedbackType ? formatLabel(row.feedbackType) : '—',
    },
    {
      header: 'Date',
      accessor: 'dateProvided' as keyof PharmaCoachingNote,
      cell: (row: PharmaCoachingNote) => formatDate(row.dateProvided),
    },
    {
      header: 'Follow-up',
      accessor: (row: PharmaCoachingNote) => {
        if (!row.followUpRequired) return '—'
        if (row.followUpCompleted) return 'Done'
        return row.followUpDate ? formatDate(row.followUpDate) : 'Pending'
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <PageHeader
          title="Coaching Notes"
          description="Field rep coaching sessions and follow-ups"
        />
        {isManager && (
          <Button size="sm" onClick={() => navigate('/coaching/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Note
          </Button>
        )}
      </div>

      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0) }}
        placeholder="Search by title…"
      />

      <DataTable
        columns={columns}
        data={notes}
        onRowClick={(row) => navigate(`/coaching/${row.id}`)}
        empty={{
          icon: AlertCircle,
          title: isSearching ? `No results for "${debouncedQuery}"` : 'No coaching notes yet',
          description: isSearching ? undefined : isManager ? 'Create the first coaching note.' : 'Your coaching notes will appear here.',
          // action: isManager && !isSearching ? (
          //   <Button size="sm" onClick={() => navigate('/coaching/new')}>
          //     <Plus className="h-4 w-4 mr-1.5" />
          //     New Note
          //   </Button>
          // ) : undefined,
        }}
      />

      {!isSearching && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
      )}
    </div>
  )
}
