import type { LucideIcon } from 'lucide-react'
import { Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatLabel } from '@/utils/formatters'
import type { PharmaFieldVisit } from '@/api/app-types'

interface VisitsSectionProps {
  visits: PharmaFieldVisit[]
  totalPages: number
  page: number
  onPageChange: (page: number) => void
  isLoading: boolean
  emptyDescription?: string
  icon?: LucideIcon
}

export function VisitsSection({
  visits,
  totalPages,
  page,
  onPageChange,
  isLoading,
  emptyDescription = 'Visits will appear here.',
  icon: Icon = Calendar,
}: VisitsSectionProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/40">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visits</h2>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : visits.length === 0 ? (
        <div className="px-5 py-8">
          <EmptyState icon={Icon} title="No visits yet" description={emptyDescription} />
        </div>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Scheduled</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visits.map((visit) => (
                <tr
                  key={visit.id}
                  onClick={() => navigate(`/visits/${visit.id}`)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{visit.subject ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{visit.visitType ? formatLabel(visit.visitType) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(visit.scheduledStart)}</td>
                  <td className="px-4 py-3">
                    {visit.status ? <StatusBadge status={visit.status} /> : '—'}
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
