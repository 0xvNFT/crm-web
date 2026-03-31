import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { useVisitsByAccount } from '@/api/endpoints/visits'
import { usePagination } from '@/hooks/usePagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate, formatLabel } from '@/utils/formatters'

interface AccountVisitsSectionProps {
  accountId: string
}

export function AccountVisitsSection({ accountId }: AccountVisitsSectionProps) {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useVisitsByAccount(accountId, page)

  const visits = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/40">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visits</h2>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : visits.length === 0 ? (
        <div className="px-5 py-8">
          <EmptyState
            icon={Calendar}
            title="No visits yet"
            description="Visits at this account will appear here."
          />
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
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
