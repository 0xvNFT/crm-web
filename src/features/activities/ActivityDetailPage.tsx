import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useActivity } from '@/api/endpoints/activities'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDate, formatDateTime, formatLabel } from '@/utils/formatters'
import type { PharmaActivity } from '@/api/app-types'

interface ActivityDetail extends PharmaActivity {
  scheduledAt?: string
  completedAt?: string
  durationMinutes?: number
  outcome?: string
  followUpRequired?: boolean
  followUpDate?: string
  followUpNotes?: string
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
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
  const { data, isLoading, isError } = useActivity(id ?? '')

  if (isLoading) return <LoadingSpinner />
  if (isError || !data) return <ErrorMessage message="Activity not found." />

  const activity = data as ActivityDetail

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{activity.subject}</h1>
            <StatusBadge status={activity.status ?? ''} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <DetailSection title="Activity Details">
          <DetailField label="Activity Type" value={activity.activityType ? formatLabel(activity.activityType) : null} />
          <DetailField label="Scheduled At" value={activity.scheduledAt ? formatDateTime(activity.scheduledAt) : null} />
          <DetailField label="Completed At" value={activity.completedAt ? formatDateTime(activity.completedAt) : null} />
          <DetailField label="Duration" value={activity.durationMinutes != null ? `${activity.durationMinutes} min` : null} />
        </DetailSection>

        {activity.description && (
          <div className="rounded-xl border bg-background p-5 space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Description</h2>
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
          <DetailField label="Activity ID" value={activity.id} />
          <DetailField label="Created" value={activity.createdAt ? formatDate(activity.createdAt) : null} />
          <DetailField label="Last Updated" value={activity.updatedAt ? formatDate(activity.updatedAt) : null} />
        </DetailSection>
      </div>
    </div>
  )
}