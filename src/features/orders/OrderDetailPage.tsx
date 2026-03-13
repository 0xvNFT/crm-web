import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useOrder } from '@/api/endpoints/orders'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/utils/formatters'

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface DetailRowProps {
  label: string
  value: React.ReactNode
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value ?? '—'}</dd>
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="rounded-md border p-4 space-y-1">
      <h2 className="text-base font-semibold mb-3">{title}</h2>
      <dl>{children}</dl>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading, isError } = useOrder(id ?? '')

  if (isLoading) return <LoadingSpinner />
  if (isError || !order) return <ErrorMessage message="Order not found." />

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
      </div>

      {/* Order Info */}
      <Section title="Order Info">
        <DetailRow label="Order #"       value={order.orderNumber} />
        <DetailRow label="Status"        value={<StatusBadge status={order.status} />} />
        <DetailRow label="Order Date"    value={formatDate(order.orderDate)} />
        <DetailRow label="Delivery Date" value={formatDate(order.deliveryDate)} />
      </Section>

      {/* Account */}
      <Section title="Account">
        <DetailRow label="Name"         value={order.account?.name} />
        <DetailRow label="Account Type" value={order.account?.accountType} />
      </Section>

      {/* Amounts */}
      <Section title="Amounts">
        <DetailRow label="Subtotal"  value={formatCurrency(order.subtotal)} />
        <DetailRow label="Discount"  value={formatCurrency(order.discountAmount)} />
        <DetailRow label="Tax"       value={formatCurrency(order.taxAmount)} />
        <DetailRow label="Total"     value={formatCurrency(order.totalAmount)} />
      </Section>

      {/* Approval */}
      <Section title="Approval">
        <DetailRow label="Approval Status" value={order.approvalStatus} />
        <DetailRow label="Approved By"     value={order.approvedBy} />
        <DetailRow label="Approved At"     value={formatDate(order.approvedAt)} />
      </Section>

      {/* Timestamps */}
      <Section title="Timestamps">
        <DetailRow label="Created" value={formatDate(order.createdAt)} />
        <DetailRow label="Updated" value={formatDate(order.updatedAt)} />
      </Section>
    </div>
  )
}