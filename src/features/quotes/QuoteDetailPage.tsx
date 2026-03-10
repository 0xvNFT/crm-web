import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useQuote } from '@/api/endpoints/quotes'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/utils/formatters'

// ─── Sub-components ────────────────────────────────────────────────────────────
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

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: quote, isLoading, isError } = useQuote(id ?? '')

  if (isLoading) return <LoadingSpinner />
  if (isError || !quote) return <ErrorMessage message="Quote not found." />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{quote.quoteNumber}</h1>
            <StatusBadge status={(quote.status ?? '').toUpperCase()} />
          </div>
          {quote.account?.name && (
            <p className="mt-1 text-sm text-muted-foreground">{quote.account.name}</p>
          )}
        </div>
      </div>

      {/* Quote Info */}
      <DetailSection title="Quote Info">
        <DetailField label="Quote Number" value={quote.quoteNumber} />
        <DetailField label="Status" value={quote.status} />
        <DetailField label="Valid From" value={formatDate(quote.validFrom)} />
      </DetailSection>

      {/* Account */}
      <DetailSection title="Account">
        <DetailField label="Account Name" value={quote.account?.name} />
      </DetailSection>

      {/* Amounts */}
      <DetailSection title="Amounts">
        <DetailField label="Subtotal" value={quote.subtotal != null ? formatCurrency(quote.subtotal) : undefined} />
        <DetailField label="Discount" value={quote.discountAmount != null ? formatCurrency(quote.discountAmount) : undefined} />
        <DetailField label="Tax" value={quote.taxAmount != null ? formatCurrency(quote.taxAmount) : undefined} />
        <DetailField label="Total" value={quote.totalAmount != null ? formatCurrency(quote.totalAmount) : undefined} />
      </DetailSection>

      {/* Timestamps */}
      <div className="rounded-xl border bg-background p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailField label="Created" value={formatDate(quote.createdAt)} />
          <DetailField label="Last Updated" value={formatDate(quote.updatedAt)} />
        </div>
      </div>
    </div>
  )
}