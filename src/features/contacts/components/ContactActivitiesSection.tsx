import { useNavigate } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { useActivitiesByContact } from '@/api/endpoints/activities'
import { usePagination } from '@/hooks/usePagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate, formatLabel } from '@/utils/formatters'

interface ContactActivitiesSectionProps {
  contactId: string
}

export function ContactActivitiesSection({ contactId }: ContactActivitiesSectionProps) {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useActivitiesByContact(contactId, page)

  const activities = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/40">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activities</h2>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : activities.length === 0 ? (
        <div className="px-5 py-8">
          <EmptyState
            icon={Activity}
            title="No activities yet"
            description="Activities logged for this contact will appear here."
          />
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
                    {activity.status ? <StatusBadge status={activity.status.toUpperCase()} /> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t">
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
