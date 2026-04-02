import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, FileText, FileCheck2 } from 'lucide-react'
import { useOrder, useApproveOrder, useRejectOrder, useGenerateInvoice } from '@/api/endpoints/orders'
import { useRole } from '@/hooks/useRole'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
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
  const { isManager, isReadOnly } = useRole()

  const { data: order, isLoading, isError } = useOrder(id ?? '')
  const { mutate: approveOrder, isPending: isApproving } = useApproveOrder(id ?? '')
  const { mutate: rejectOrder, isPending: isRejecting } = useRejectOrder(id ?? '')
  const { mutate: generateInvoice, isPending: isGenerating } = useGenerateInvoice(id ?? '')

  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [showGenerateInvoice, setShowGenerateInvoice] = useState(false)

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !order) return <ErrorMessage message="Order not found." />

  const isPending = order.status === 'pending' || order.status === 'submitted'
  const canAct = isManager && isPending && !isReadOnly
  const canEdit = (order.status === 'draft' || order.status === 'pending') && !isReadOnly
  const canGenerateInvoice = isManager && !isReadOnly && (
    order.status === 'processing' || order.approvalStatus === 'approved'
  )

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
          {order.accountName && (
            <p className="mt-1 text-sm text-muted-foreground">{order.accountName}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canGenerateInvoice && (
            <Button size="sm" onClick={() => setShowGenerateInvoice(true)} disabled={isGenerating}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>
          )}
          {canAct && (
            <>
              <Button variant="outline" onClick={() => setShowApprove(true)}>
                Approve
              </Button>
              <Button variant="destructive" onClick={() => setShowReject(true)}>
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Order Info */}
      <Section title="Order Info">
        <DetailRow label="Order #"       value={order.orderNumber} />
        <DetailRow label="Status"        value={order.status ? <StatusBadge status={order.status} /> : '—'} />
        <DetailRow label="Order Date"    value={order.orderDate ? formatDate(order.orderDate) : null} />
        <DetailRow label="Delivery Date" value={order.deliveryDate ? formatDate(order.deliveryDate) : null} />
        {order.sourceQuoteId && (
          <DetailRow
            label="Source Quote"
            value={
              <button
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                onClick={() => navigate(`/quotes/${order.sourceQuoteId}`)}
              >
                <FileCheck2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                {order.sourceQuoteNumber ?? 'View Quote'}
              </button>
            }
          />
        )}
        {order.notes && <DetailRow label="Notes" value={order.notes} />}
      </Section>

      {/* Account */}
      <Section title="Account">
        <DetailRow label="Name"         value={order.accountName} />
      </Section>

      {/* Line Items */}
      {order.items && order.items.length > 0 && (
        <div className="rounded-xl border bg-background p-5 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium text-muted-foreground">Product</th>
                  <th className="pb-2 text-left font-medium text-muted-foreground pl-4">Batch</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Qty</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Unit Price</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Disc %</th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={item.id ?? i} className="border-b last:border-0">
                    <td className="py-2">{item.productName ?? '—'}</td>
                    <td className="py-2 pl-4 text-muted-foreground">{item.batchNumber ?? '—'}</td>
                    <td className="py-2 text-right">{item.quantity ?? '—'}</td>
                    <td className="py-2 text-right">{item.unitPrice != null ? formatCurrency(item.unitPrice) : '—'}</td>
                    <td className="py-2 text-right">{item.discountPercent != null ? `${item.discountPercent}%` : '—'}</td>
                    <td className="py-2 text-right font-medium">{item.lineTotal != null ? formatCurrency(item.lineTotal) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        <DetailRow label="Approved By"     value={order.approvedByName} />
        <DetailRow label="Approved At"     value={order.approvedAt ? formatDate(order.approvedAt) : null} />
      </Section>

      {/* Timestamps */}
      <Section title="Timestamps">
        <DetailRow label="Created" value={order.createdAt ? formatDate(order.createdAt) : null} />
        <DetailRow label="Updated" value={order.updatedAt ? formatDate(order.updatedAt) : null} />
      </Section>

      {/* Generate Invoice dialog */}
      <ConfirmDialog
        open={showGenerateInvoice}
        onCancel={() => setShowGenerateInvoice(false)}
        onConfirm={() =>
          generateInvoice(undefined, {
            onSuccess: (invoice) => {
              toast('Invoice generated', { variant: 'success' })
              navigate(`/invoices/${invoice.id}`)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setShowGenerateInvoice(false)
            },
          })
        }
        title="Generate Invoice?"
        description="This will create an invoice pre-populated from this order's line items and account."
        confirmLabel="Generate"
        isPending={isGenerating}
      />

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
