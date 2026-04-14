import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { useActivity } from '@/api/endpoints/activities'
import { EntityHistorySection } from '@/components/shared/EntityHistorySection'
import { useRole } from '@/hooks/useRole'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDate, formatDateTime, formatLabel } from '@/utils/formatters'

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
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

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useRole()
  const { data: activity, isLoading, isError } = useActivity(id ?? '')

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !activity) return <ErrorMessage message="Activity not found." />

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{activity.subject}</h1>
            <StatusBadge status={activity.status ?? 'unknown'} />
          </div>
        </div>
        {isManager && (
          <Button variant="outline" size="sm" onClick={() => navigate(`/activities/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
            Edit
          </Button>
        )}
      </div>

      <DetailSection title="Activity Details">
        <DetailField label="Activity Type" value={activity.activityType ? formatLabel(activity.activityType) : null} />
        <DetailField label="Due Date" value={activity.dueDate ? formatDate(activity.dueDate) : null} />
        <DetailField label="Completed At" value={activity.completedAt ? formatDateTime(activity.completedAt) : null} />
        <DetailField label="Duration" value={activity.durationMinutes != null ? `${activity.durationMinutes} min` : null} />
      </DetailSection>

      {activity.description && (
        <div className="rounded-xl border bg-background p-5 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{activity.description}</p>
        </div>
      )}

      <DetailSection title="Outcome & Follow-up">
        <DetailField label="Outcome" value={activity.outcome} />
        <DetailField label="Follow-up Required" value={activity.followUpRequired} />
        <DetailField label="Follow-up Date" value={activity.followUpDate ? formatDate(activity.followUpDate) : null} />
        <DetailField label="Follow-up Notes" value={activity.followUpNotes} />
      </DetailSection>

      <DetailSection title="Timestamps">
        <DetailField label="Created" value={activity.createdAt ? formatDate(activity.createdAt) : null} />
        <DetailField label="Last Updated" value={activity.updatedAt ? formatDate(activity.updatedAt) : null} />
      </DetailSection>

      <EntityHistorySection entityType="PharmaActivity" entityId={id ?? ''} />
    </div>
  )
}
