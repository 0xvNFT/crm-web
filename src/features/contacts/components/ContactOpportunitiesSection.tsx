import { useNavigate } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { useOpportunitiesByContact } from '@/api/endpoints/opportunities'
import { usePagination } from '@/hooks/usePagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate, formatCurrency, formatLabel } from '@/utils/formatters'

interface ContactOpportunitiesSectionProps {
  contactId: string
}

export function ContactOpportunitiesSection({ contactId }: ContactOpportunitiesSectionProps) {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useOpportunitiesByContact(contactId, page)

  const opportunities = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/40">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opportunities</h2>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : opportunities.length === 0 ? (
        <div className="px-5 py-8">
          <EmptyState
            icon={TrendingUp}
            title="No opportunities yet"
            description="Opportunities linked to this contact will appear here."
          />
        </div>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topic</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Stage</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Close Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {opportunities.map((opp) => (
                <tr
                  key={opp.id}
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{opp.topic}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{opp.salesStage ? formatLabel(opp.salesStage) : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(opp.estCloseDate)}</td>
                  <td className="px-4 py-3">
                    {opp.status ? <StatusBadge status={opp.status.toUpperCase()} /> : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground hidden sm:table-cell">
                    {opp.estRevenue != null ? formatCurrency(opp.estRevenue) : '—'}
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
