import { useNavigate } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { useInvoicesByAccount } from '@/api/endpoints/invoices'
import { usePagination } from '@/hooks/usePagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate, formatCurrency } from '@/utils/formatters'

interface AccountInvoicesSectionProps {
  accountId: string
}

export function AccountInvoicesSection({ accountId }: AccountInvoicesSectionProps) {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useInvoicesByAccount(accountId, page)

  const invoices = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/40">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoices</h2>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</div>
      ) : invoices.length === 0 ? (
        <div className="px-5 py-8">
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            description="Invoices linked to this account will appear here."
          />
        </div>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice #</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Due</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => navigate(`/invoices/${inv.id}`)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{inv.invoiceNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(inv.invoiceDate)}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3">
                    {inv.status ? <StatusBadge status={inv.status} /> : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {inv.totalAmount != null ? formatCurrency(inv.totalAmount) : '—'}
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
