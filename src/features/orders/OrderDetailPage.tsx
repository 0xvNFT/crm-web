import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useOrder } from '@/api/endpoints/orders'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/utils/formatters'

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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading, isError } = useOrder(id ?? '')

  if (isLoading) return <LoadingSpinner />
  if (isError || !order) return <ErrorMessage message="Order not found." />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Order #{order.orderNumber}
            </h1>
            <StatusBadge status={(order.status ?? '').toUpperCase()} />
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {order.account?.name && <span>{order.account.name}</span>}
            {order.owner?.fullName && (
              <>
                <span>·</span>
                <span>{order.owner.fullName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sections */}
      <DetailSection title="Order Info">
        <DetailField label="Order Number" value={order.orderNumber} />
        <DetailField label="Status" value={order.status} />
        <DetailField label="Order Date" value={formatDate(order.orderDate)} />
        <DetailField label="Delivery Date" value={formatDate(order.deliveryDate)} />
      </DetailSection>

      <DetailSection title="Account">
        <DetailField label="Account Name" value={order.account?.name} />
        <DetailField label="Account Type" value={order.account?.accountType} />
      </DetailSection>

      <DetailSection title="Amounts">
        <DetailField label="Subtotal" value={formatCurrency(order.subtotal)} />
        <DetailField label="Discount" value={formatCurrency(order.discountAmount)} />
        <DetailField label="Tax" value={formatCurrency(order.taxAmount)} />
        <DetailField label="Total" value={formatCurrency(order.totalAmount)} />
      </DetailSection>

      <DetailSection title="Approval">
        <DetailField label="Approval Status" value={order.approvalStatus} />
        <DetailField label="Approved By" value={order.approvedBy} />
        <DetailField label="Approved At" value={formatDate(order.approvedAt)} />
      </DetailSection>

      <div className="rounded-xl border bg-background p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailField label="Created" value={formatDate(order.createdAt)} />
          <DetailField label="Last Updated" value={formatDate(order.updatedAt)} />
        </div>
      </div>
    </div>
  )
}