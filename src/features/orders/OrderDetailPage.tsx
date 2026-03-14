import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useOrder, useApproveOrder, useRejectOrder } from '@/api/endpoints/orders'
import { useRole } from '@/hooks/useRole'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { formatCurrency, formatDate } from '@/utils/formatters'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value ?? '—'}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <dl>{children}</dl>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useRole()

  const { data: order, isLoading, isError } = useOrder(id ?? '')
  const { mutate: approveOrder, isPending: isApproving } = useApproveOrder(id ?? '')
  const { mutate: rejectOrder, isPending: isRejecting } = useRejectOrder(id ?? '')

  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)

  if (isLoading) return <LoadingSpinner />
  if (isError || !order) return <ErrorMessage message="Order not found." />

  const isPending = order.status === 'pending' || order.status === 'submitted'
  const canAct = isManager && isPending

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
            {order.status && <StatusBadge status={order.status} />}
          </div>
          {order.account?.name && (
            <p className="mt-1 text-sm text-muted-foreground">{order.account.name}</p>
          )}
        </div>
        {canAct && (
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" onClick={() => setShowApprove(true)}>
              Approve
            </Button>
            <Button variant="destructive" onClick={() => setShowReject(true)}>
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Order Info */}
      <Section title="Order Info">
        <DetailRow label="Order #"       value={order.orderNumber} />
        <DetailRow label="Status"        value={<StatusBadge status={order.status} />} />
        <DetailRow label="Order Date"    value={order.orderDate ? formatDate(order.orderDate) : null} />
        <DetailRow label="Delivery Date" value={order.deliveryDate ? formatDate(order.deliveryDate) : null} />
        {order.notes && <DetailRow label="Notes" value={order.notes} />}
      </Section>

      {/* Account */}
      <Section title="Account">
        <DetailRow label="Name"         value={order.account?.name} />
        <DetailRow label="Account Type" value={order.account?.accountType} />
      </Section>

      {/* Amounts */}
      <Section title="Amounts">
        <DetailRow label="Subtotal"  value={order.subtotal != null ? formatCurrency(order.subtotal) : null} />
        <DetailRow label="Discount"  value={order.discountAmount != null ? formatCurrency(order.discountAmount) : null} />
        <DetailRow label="Tax"       value={order.taxAmount != null ? formatCurrency(order.taxAmount) : null} />
        <DetailRow label="Total"     value={order.totalAmount != null ? formatCurrency(order.totalAmount) : null} />
      </Section>

      {/* Approval */}
      <Section title="Approval">
        <DetailRow label="Approval Status" value={order.approvalStatus} />
        <DetailRow label="Approved By"     value={order.approvedBy} />
        <DetailRow label="Approved At"     value={order.approvedAt ? formatDate(order.approvedAt) : null} />
      </Section>

      {/* Timestamps */}
      <Section title="Timestamps">
        <DetailRow label="Created" value={order.createdAt ? formatDate(order.createdAt) : null} />
        <DetailRow label="Updated" value={order.updatedAt ? formatDate(order.updatedAt) : null} />
      </Section>

      {/* Approve dialog */}
      <ConfirmDialog
        open={showApprove}
        onCancel={() => setShowApprove(false)}
        onConfirm={() =>
          approveOrder(undefined, {
            onSuccess: () => {
              toast('Order approved', { variant: 'success' })
              setShowApprove(false)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setShowApprove(false)
            },
          })
        }
        title="Approve Order?"
        description="This will approve the order and notify the rep. This action cannot be undone."
        confirmLabel="Approve"
        isPending={isApproving}
      />

      {/* Reject dialog */}
      <ConfirmDialog
        open={showReject}
        onCancel={() => setShowReject(false)}
        onConfirm={(reason) =>
          rejectOrder(reason!, {
            onSuccess: () => {
              toast('Order rejected', { variant: 'success' })
              setShowReject(false)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setShowReject(false)
            },
          })
        }
        title="Reject Order?"
        description="Provide a reason for rejection. The rep will be notified."
        confirmLabel="Reject"
        isPending={isRejecting}
        requireReason
        reasonPlaceholder="e.g. Exceeds budget limit, missing approval..."
      />
    </div>
  )
}
