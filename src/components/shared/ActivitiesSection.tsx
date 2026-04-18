import type { LucideIcon } from 'lucide-react'
import { Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatLabel } from '@/utils/formatters'
import type { PharmaActivity } from '@/api/app-types'

interface ActivitiesSectionProps {
  activities: PharmaActivity[]
  totalPages: number
  page: number
  onPageChange: (page: number) => void
  isLoading: boolean
  emptyDescription?: string
  icon?: LucideIcon
}

export function ActivitiesSection({
  activities,
  totalPages,
  page,
  onPageChange,
  isLoading,
  emptyDescription = 'Activities will appear here.',
  icon: Icon = Activity,
}: ActivitiesSectionProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/40">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activities</h2>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : activities.length === 0 ? (
        <div className="px-5 py-8">
          <EmptyState icon={Icon} title="No activities yet" description={emptyDescription} />
        </div>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Due</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activities.map((activity) => (
                <tr
                  key={activity.id}
                  onClick={() => navigate(`/activities/${activity.id}`)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{activity.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatLabel(activity.activityType)}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(activity.dueDate)}</td>
                  <td className="px-4 py-3">
                    {activity.status ? <StatusBadge status={activity.status} /> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t">
              <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
