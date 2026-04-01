import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, RefreshCw, TrendingUp } from 'lucide-react'
import { useQuote, useApproveQuote, useRejectQuote, useConvertQuote } from '@/api/endpoints/quotes'
import { useRole } from '@/hooks/useRole'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { formatDate, formatCurrency } from '@/utils/formatters'

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

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useRole()

  const { data: quote, isLoading, isError } = useQuote(id ?? '')
  const { mutate: approveQuote, isPending: isApproving } = useApproveQuote(id ?? '')
  const { mutate: rejectQuote, isPending: isRejecting } = useRejectQuote(id ?? '')
  const { mutate: convertQuote, isPending: isConverting } = useConvertQuote(id ?? '')

  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [showConvert, setShowConvert] = useState(false)

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !quote) return <ErrorMessage message="Quote not found." />

  const isSubmitted = quote.status === 'submitted' || quote.status === 'pending'
  const isApproved = quote.status === 'approved'
  const isDraft = quote.status === 'draft'
  const canAct = isManager && isSubmitted
  const canConvert = isApproved

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{quote.quoteNumber}</h1>
            {quote.status && <StatusBadge status={quote.status} />}
          </div>
          {quote.accountName && (
            <p className="mt-1 text-sm text-muted-foreground">{quote.accountName}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {isDraft && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/quotes/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          {canConvert && (
            <Button size="sm" onClick={() => setShowConvert(true)} disabled={isConverting}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Convert to Order
            </Button>
          )}
          {canAct && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowApprove(true)}>
                Approve
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowReject(true)}>
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <DetailSection title="Quote Info">
        <DetailField label="Quote Number" value={quote.quoteNumber} />
        <DetailField label="Status"       value={quote.status} />
        <DetailField label="Valid From"   value={quote.validFrom ? formatDate(quote.validFrom) : null} />
        <DetailField label="Valid Until"  value={quote.validUntil ? formatDate(quote.validUntil) : null} />
        {quote.opportunityId && (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Opportunity</p>
            <button
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              onClick={() => navigate(`/opportunities/${quote.opportunityId}`)}
            >
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
              {quote.opportunityName ?? 'View Opportunity'}
            </button>
          </div>
        )}
      </DetailSection>

      <DetailSection title="Account">
        <DetailField label="Account Name" value={quote.accountName} />
      </DetailSection>

      {/* Line Items */}
      {quote.items && quote.items.length > 0 && (
        <div className="rounded-xl border bg-background p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Product</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Qty</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Unit Price</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Disc %</th>
                  <th className="pb-2 pl-4 text-left font-medium text-muted-foreground">Notes</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item, i) => (
                  <tr key={item.id ?? i} className="border-b last:border-0">
                    <td className="py-2">{item.productName ?? '—'}</td>
                    <td className="py-2 text-right">{item.quantity ?? '—'}</td>
                    <td className="py-2 text-right">{item.unitPrice != null ? formatCurrency(item.unitPrice) : '—'}</td>
                    <td className="py-2 text-right">{item.discountPercent != null ? `${item.discountPercent}%` : '—'}</td>
                    <td className="py-2 pl-4 text-left text-muted-foreground">{item.notes ?? '—'}</td>
                    <td className="py-2 text-right font-medium">{item.lineTotal != null ? formatCurrency(item.lineTotal) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DetailSection title="Amounts">
        <DetailField label="Subtotal" value={quote.subtotal != null ? formatCurrency(quote.subtotal) : null} />
        <DetailField label="Discount" value={quote.discountAmount != null ? formatCurrency(quote.discountAmount) : null} />
        <DetailField label="Tax"      value={quote.taxAmount != null ? formatCurrency(quote.taxAmount) : null} />
        <DetailField label="Total"    value={quote.totalAmount != null ? formatCurrency(quote.totalAmount) : null} />
      </DetailSection>

      <DetailSection title="Timestamps">
        <DetailField label="Created"      value={quote.createdAt ? formatDate(quote.createdAt) : null} />
        <DetailField label="Last Updated" value={quote.updatedAt ? formatDate(quote.updatedAt) : null} />
      </DetailSection>

      {/* Convert to Order dialog */}
      <ConfirmDialog
        open={showConvert}
        onCancel={() => setShowConvert(false)}
        onConfirm={() =>
          convertQuote(undefined, {
            onSuccess: (order) => {
              toast('Quote converted to order', { variant: 'success' })
              navigate(`/orders/${order.id}`)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setShowConvert(false)
            },
          })
        }
        title="Convert to Order?"
        description="This will create a new order from this quote. The quote status will be updated to converted."
        confirmLabel="Convert"
        isPending={isConverting}
      />

      {/* Approve dialog */}
      <ConfirmDialog
        open={showApprove}
        onCancel={() => setShowApprove(false)}
        onConfirm={() =>
          approveQuote(undefined, {
            onSuccess: () => {
              toast('Quote approved', { variant: 'success' })
              setShowApprove(false)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setShowApprove(false)
            },
          })
        }
        title="Approve Quote?"
        description="This will approve the quote and notify the rep. This action cannot be undone."
        confirmLabel="Approve"
        isPending={isApproving}
      />

      {/* Reject dialog */}
      <ConfirmDialog
        open={showReject}
        onCancel={() => setShowReject(false)}
        onConfirm={(reason) =>
          rejectQuote(reason!, {
            onSuccess: () => {
              toast('Quote rejected', { variant: 'success' })
              setShowReject(false)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setShowReject(false)
            },
          })
        }
        title="Reject Quote?"
        description="Provide a reason for rejection. The rep will be notified."
        confirmLabel="Reject"
        isPending={isRejecting}
        requireReason
        reasonPlaceholder="e.g. Pricing not aligned, needs revision..."
      />
    </div>
  )
}
