import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useQuote } from '@/api/endpoints/quotes'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
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

  const { data: quote, isLoading, isError } = useQuote(id ?? '')

  if (isLoading) return <LoadingSpinner />
  if (isError || !quote) return <ErrorMessage message="Quote not found." />

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
          {quote.account?.name && (
            <p className="mt-1 text-sm text-muted-foreground">{quote.account.name}</p>
          )}
        </div>
      </div>

      <DetailSection title="Quote Info">
        <DetailField label="Quote Number" value={quote.quoteNumber} />
        <DetailField label="Status" value={quote.status} />
        <DetailField label="Valid From" value={quote.validFrom ? formatDate(quote.validFrom) : null} />
        <DetailField label="Valid Until" value={quote.validUntil ? formatDate(quote.validUntil) : null} />
      </DetailSection>

      <DetailSection title="Account">
        <DetailField label="Account Name" value={quote.account?.name} />
        <DetailField label="Account Type" value={quote.account?.accountType} />
      </DetailSection>

      <DetailSection title="Amounts">
        <DetailField label="Subtotal" value={quote.subtotal != null ? formatCurrency(quote.subtotal) : undefined} />
        <DetailField label="Discount" value={quote.discountAmount != null ? formatCurrency(quote.discountAmount) : undefined} />
        <DetailField label="Tax" value={quote.taxAmount != null ? formatCurrency(quote.taxAmount) : undefined} />
        <DetailField label="Total" value={quote.totalAmount != null ? formatCurrency(quote.totalAmount) : undefined} />
      </DetailSection>

      <DetailSection title="Timestamps">
        <DetailField label="Created" value={quote.createdAt ? formatDate(quote.createdAt) : null} />
        <DetailField label="Last Updated" value={quote.updatedAt ? formatDate(quote.updatedAt) : null} />
      </DetailSection>
    </div>
  )
}
