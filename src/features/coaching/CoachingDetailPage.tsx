import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, CheckCircle } from 'lucide-react'
import { useCoachingNote, useCompleteFollowUp } from '@/api/endpoints/coaching'
import { useRole } from '@/hooks/useRole'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { formatDate, formatLabel } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { useState } from 'react'

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : String(value)
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  )
}

export default function CoachingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useRole()
  const [showComplete, setShowComplete] = useState(false)

  const { data: note, isLoading, isError } = useCoachingNote(id ?? '')
  const { mutate: completeFollowUp, isPending: isCompleting } = useCompleteFollowUp(id ?? '')

  if (isLoading) return <LoadingSpinner />
  if (isError || !note) return <ErrorMessage message="Coaching note not found." />

  const followUpPending = note.followUpRequired && !note.followUpCompleted

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{note.noteTitle ?? '—'}</h1>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {note.salesRepName && <span>{note.salesRepName}</span>}
            {note.coachName && (
              <>
                <span>·</span>
                <span>Coached by {note.coachName}</span>
              </>
            )}
            {note.feedbackType && (
              <>
                <span>·</span>
                <span>{formatLabel(note.feedbackType)}</span>
              </>
            )}
            {note.dateProvided && (
              <>
                <span>·</span>
                <span>{formatDate(note.dateProvided)}</span>
              </>
            )}
          </div>
        </div>

        {isManager && (
          <div className="flex items-center gap-2 shrink-0">
            {followUpPending && (
              <Button size="sm" variant="outline" onClick={() => setShowComplete(true)}>
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Complete Follow-up
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate(`/coaching/${id}/edit`)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* Follow-up status banner */}
      {note.followUpRequired && (
        <div className={[
          'rounded-xl border px-5 py-3 text-sm flex items-center gap-2',
          note.followUpCompleted
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-amber-50 border-amber-200 text-amber-800',
        ].join(' ')}>
          <CheckCircle className="h-4 w-4 shrink-0" />
          {note.followUpCompleted
            ? 'Follow-up completed.'
            : `Follow-up required${note.followUpDate ? ` by ${formatDate(note.followUpDate)}` : ''}.`}
        </div>
      )}

      <DetailSection title="Coaching Info">
        <DetailField label="Rep"           value={note.salesRepName} />
        <DetailField label="Coach"         value={note.coachName} />
        <DetailField label="Feedback Type" value={formatLabel(note.feedbackType)} />
        <DetailField label="Date Provided" value={formatDate(note.dateProvided)} />
        <DetailField label="Territory"     value={note.territoryName} />
        {note.visitId && (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Linked Visit</p>
            <button
              onClick={() => navigate(`/visits/${note.visitId}`)}
              className="text-sm text-primary hover:underline"
            >
              {note.visitNumber ?? 'View visit'}
            </button>
          </div>
        )}
      </DetailSection>

      {(note.reviewedModule || note.moduleProgressPct != null) && (
        <DetailSection title="Module Review">
          <DetailField label="Reviewed Module"    value={note.reviewedModule} />
          <DetailField label="Module Progress (%)" value={note.moduleProgressPct} />
        </DetailSection>
      )}

      {note.detailedFeedback && (
        <div className="rounded-xl border bg-background p-5 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Detailed Feedback</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{note.detailedFeedback}</p>
        </div>
      )}

      {note.summaryOfFeedback && (
        <div className="rounded-xl border bg-background p-5 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{note.summaryOfFeedback}</p>
        </div>
      )}

      {note.aiSuggestedNextSteps && (
        <div className="rounded-xl border bg-background p-5 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Suggested Next Steps</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap">{note.aiSuggestedNextSteps}</p>
        </div>
      )}

      <div className="rounded-xl border bg-background p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DetailField label="Note ID"      value={note.id} />
          <DetailField label="Created"      value={formatDate(note.createdAt)} />
          <DetailField label="Last Updated" value={formatDate(note.updatedAt)} />
        </div>
      </div>

      <ConfirmDialog
        open={showComplete}
        onCancel={() => setShowComplete(false)}
        onConfirm={() =>
          completeFollowUp(undefined, {
            onSuccess: () => {
              toast('Follow-up marked as completed', { variant: 'success' })
              setShowComplete(false)
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Complete Follow-up?"
        description="This will mark the follow-up as completed. This cannot be undone."
        confirmLabel="Complete"
        isPending={isCompleting}
      />
    </div>
  )
}
