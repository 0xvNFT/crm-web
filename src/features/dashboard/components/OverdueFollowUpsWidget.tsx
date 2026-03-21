import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useOverdueFollowUps } from '@/api/endpoints/coaching'
import { formatDate } from '@/utils/formatters'

export function OverdueFollowUpsWidget() {
  const navigate = useNavigate()
  const { data, isLoading } = useOverdueFollowUps(0, 5)
  const notes = data?.content ?? []

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/40 flex items-center gap-2">
        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Overdue Follow-ups
        </h2>
        {!isLoading && notes.length > 0 && (
          <span className="ml-auto inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            {data?.totalElements ?? notes.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="px-5 py-6 text-center text-sm text-muted-foreground">Loading…</div>
      ) : notes.length === 0 ? (
        <div className="px-5 py-6 text-center text-sm text-muted-foreground">
          No overdue follow-ups.
        </div>
      ) : (
        <div className="divide-y">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => navigate(`/coaching/${note.id}`)}
              className="w-full flex items-start justify-between px-5 py-3 text-left hover:bg-muted/30 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{note.noteTitle ?? '—'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{note.salesRep?.fullName ?? '—'}</p>
              </div>
              <span className="text-xs text-destructive font-medium shrink-0 ml-4">
                {note.followUpDate ? formatDate(note.followUpDate) : 'No date'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
