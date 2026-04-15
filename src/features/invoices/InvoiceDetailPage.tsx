import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import {
  useInvoice,
  useSendInvoice,
  usePayInvoice,
  useVoidInvoice,
} from '@/api/endpoints/invoices'
import { useRole } from '@/hooks/useRole'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EntityHistorySection } from '@/components/shared/EntityHistorySection'
import { EntityNotesSection } from '@/components/shared/EntityNotesSection'
import { EntityTagsSection } from '@/components/shared/EntityTagsSection'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PharmaInvoiceItem } from '@/api/app-types'

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

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()

  const { data: invoice, isLoading, isError } = useInvoice(id ?? '')
  const { mutate: sendInvoice,  isPending: isSending  } = useSendInvoice(id ?? '')
  const { mutate: payInvoice,   isPending: isPaying   } = usePayInvoice(id ?? '')
  const { mutate: voidInvoice,  isPending: isVoiding  } = useVoidInvoice(id ?? '')

  const [showSend, setShowSend]   = useState(false)
  const [showPay,  setShowPay]    = useState(false)
  const [showVoid, setShowVoid]   = useState(false)

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !invoice) return <ErrorMessage message="Invoice not found." />

  const status   = invoice.status ?? 'draft'
  const isDraft  = status === 'draft'
  const isSent   = status === 'sent'
  const isPaid   = status === 'paid'
  const isVoided = status === 'canceled' || status === 'void'
  const canAct   = isManager && !isPaid && !isVoided && !invoice.isLocked && !isReadOnly

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{invoice.invoiceNumber}</h1>
            <StatusBadge status={status} />
            {invoice.isLocked && (
              <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">Locked</span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{invoice.subject}</p>
        </div>
        {canAct && (
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            {isDraft && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/invoices/${id}/edit`)}>
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
            )}
            {isDraft && (
              <Button size="sm" onClick={() => setShowSend(true)}>
                Send Invoice
              </Button>
            )}
            {isSent && (
              <Button onClick={() => setShowPay(true)}>
                Mark as Paid
              </Button>
            )}
            {!isPaid && (
              <Button variant="destructive" onClick={() => setShowVoid(true)}>
                Void
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Invoice Info */}
      <Section title="Invoice Info">
        <DetailRow label="Invoice #"     value={invoice.invoiceNumber} />
        <DetailRow label="Subject"       value={invoice.subject} />
        <DetailRow label="Status"        value={<StatusBadge status={status} />} />
        <DetailRow label="Invoice Date"  value={formatDate(invoice.invoiceDate)} />
        <DetailRow label="Due Date"      value={formatDate(invoice.dueDate)} />
        {invoice.paymentTerms && <DetailRow label="Payment Terms" value={invoice.paymentTerms} />}
        {invoice.currency && <DetailRow label="Currency" value={invoice.currency} />}
      </Section>

      {/* Account & Contacts */}
      <Section title="Account">
        <DetailRow
          label="Account"
          value={
            invoice.accountId
              ? <Link to={`/accounts/${invoice.accountId}`} className="text-primary hover:underline">{invoice.accountName}</Link>
              : invoice.accountName
          }
        />
        {invoice.contactId && (
          <DetailRow
            label="Contact"
            value={
              <Link to={`/contacts/${invoice.contactId}`} className="text-primary hover:underline">
                {invoice.contactName}
              </Link>
            }
          />
        )}
        {invoice.billingAddress && <DetailRow label="Billing Address" value={invoice.billingAddress} />}
        {invoice.shippingAddress && <DetailRow label="Shipping Address" value={invoice.shippingAddress} />}
        {invoice.shippingMethod && <DetailRow label="Shipping Method" value={invoice.shippingMethod} />}
      </Section>

      {/* Source */}
      {(invoice.orderId || invoice.quoteId) && (
        <Section title="Source">
          {invoice.orderId && (
            <DetailRow
              label="Order"
              value={
                <Link to={`/orders/${invoice.orderId}`} className="text-primary hover:underline">
                  {invoice.orderNumber ?? invoice.orderId}
                </Link>
              }
            />
          )}
          {invoice.quoteId && (
            <DetailRow
              label="Quote"
              value={
                <Link to={`/quotes/${invoice.quoteId}`} className="text-primary hover:underline">
                  {invoice.quoteNumber ?? invoice.quoteId}
                </Link>
              }
            />
          )}
        </Section>
      )}

      {/* Line Items */}
      {invoice.items && invoice.items.length > 0 && (
        <div className="rounded-xl border bg-background overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Product / Description</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Qty</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Unit Price</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Discount</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Tax</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item: PharmaInvoiceItem, i) => (
                  <tr key={item.id ?? i} className="hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <p className="font-medium">{item.productName ?? '—'}</p>
                      {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                    </td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">{item.unitPrice != null ? formatCurrency(item.unitPrice) : '—'}</td>
                    <td className="px-4 py-2 text-right">{item.discountAmount != null ? formatCurrency(item.discountAmount) : '—'}</td>
                    <td className="px-4 py-2 text-right">{item.taxAmount != null ? formatCurrency(item.taxAmount) : '—'}</td>
                    <td className="px-4 py-2 text-right font-medium">{item.extendedAmount != null ? formatCurrency(item.extendedAmount) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Amounts */}
      <Section title="Amounts">
        <DetailRow label="Total Amount" value={invoice.totalAmount != null ? formatCurrency(invoice.totalAmount) : '—'} />
        <DetailRow label="Balance Due"  value={invoice.balanceDue  != null ? formatCurrency(invoice.balanceDue)  : '—'} />
        {invoice.taxExempt && <DetailRow label="Tax Exempt" value="Yes" />}
      </Section>

      {/* Timestamps */}
      <Section title="Timestamps">
        <DetailRow label="Created" value={invoice.createdAt ? formatDate(invoice.createdAt) : null} />
        <DetailRow label="Updated" value={invoice.updatedAt ? formatDate(invoice.updatedAt) : null} />
      </Section>

      <EntityTagsSection entityType="PharmaInvoice" entityId={id ?? ''} />
          <EntityNotesSection entityType="PharmaInvoice" entityId={id ?? ''} />
      <EntityHistorySection entityType="PharmaInvoice" entityId={id ?? ''} />

      {/* Send dialog */}
      <ConfirmDialog
        open={showSend}
        onCancel={() => setShowSend(false)}
        onConfirm={() =>
          sendInvoice(undefined, {
            onSuccess: () => { toast('Invoice sent', { variant: 'success' }); setShowSend(false) },
            onError: (err) => { toast(parseApiError(err), { variant: 'destructive' }); setShowSend(false) },
          })
        }
        title="Send Invoice?"
        description="This will mark the invoice as sent and notify the customer. Status will change from Draft to Sent."
        confirmLabel="Send"
        isPending={isSending}
      />

      {/* Pay dialog */}
      <ConfirmDialog
        open={showPay}
        onCancel={() => setShowPay(false)}
        onConfirm={() =>
          payInvoice(undefined, {
            onSuccess: () => { toast('Invoice marked as paid', { variant: 'success' }); setShowPay(false) },
            onError: (err) => { toast(parseApiError(err), { variant: 'destructive' }); setShowPay(false) },
          })
        }
        title="Mark as Paid?"
        description="This will mark the invoice as paid. This action cannot be undone."
        confirmLabel="Mark as Paid"
        isPending={isPaying}
      />

      {/* Void dialog */}
      <ConfirmDialog
        open={showVoid}
        onCancel={() => setShowVoid(false)}
        onConfirm={() =>
          voidInvoice(undefined, {
            onSuccess: () => { toast('Invoice voided', { variant: 'success' }); setShowVoid(false) },
            onError: (err) => { toast(parseApiError(err), { variant: 'destructive' }); setShowVoid(false) },
          })
        }
        title="Void Invoice?"
        description="This will cancel the invoice permanently. This action cannot be undone."
        confirmLabel="Void Invoice"
        isPending={isVoiding}
      />
    </div>
  )
}
