// REFERENCE PATTERN — Interns: copy the view mode structure only (DetailSection, DetailField, header, quick-contact strip).
// Ignore everything related to editing (useForm, useUpdateOrder, editing state, FormSection, FormRow, edit form JSX).
// Your task is read-only — list + detail view. No create or edit required.
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Building2, Calendar, User, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useOrder, useDeleteOrder } from '@/api/endpoints/orders';
import { useRole } from '@/hooks/useRole';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';
import { parseApiError } from '@/utils/errors';
import { toast } from '@/hooks/useToast';

// ─── Sub-components ────────────────────────────────────────────────────────────
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : String(value);

  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);

  const { data: order, isLoading, isError } = useOrder(id ?? '');
  const { mutate: deleteOrder, isPending: isDeleting } = useDeleteOrder();
  const { isManager } = useRole();

  if (isLoading) return <LoadingSpinner />;
  if (isError || !order) return <ErrorMessage message="Order not found." />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Order {order.orderNumber}</h1>
            <StatusBadge status={order.status?.toUpperCase() ?? 'UNKNOWN'} />
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {order.account?.name && (
              <>
                <span>{order.account.name}</span>
                <span>·</span>
              </>
            )}
            <span>Created {formatDate(order.createdAt)}</span>
            {order.owner?.fullName && (
              <>
                <span>·</span>
                <span>by {order.owner.fullName}</span>
              </>
            )}
          </div>
        </div>

        {isManager && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
              <XCircle className="h-3.5 w-3.5 mr-1.5" />
              Cancel Order
            </Button>
          </div>
        )}
      </div>

      {/* Quick info strip */}
      <div className="flex flex-wrap gap-3">
        {order.orderDate && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            Order Date: {formatDate(order.orderDate)}
          </span>
        )}
        {order.deliveryDate && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <Package className="h-3.5 w-3.5" strokeWidth={1.75} />
            Delivery: {formatDate(order.deliveryDate)}
          </span>
        )}
        {order.totalAmount && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm font-medium text-foreground">
            <DollarSign className="h-3.5 w-3.5" strokeWidth={1.75} />
            Total: {formatCurrency(order.totalAmount)}
          </span>
        )}
        {order.owner?.fullName && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" strokeWidth={1.75} />
            Owner: {order.owner.fullName}
          </span>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={() =>
          deleteOrder(id ?? '', {
            onSuccess: () => {
              toast('Order cancelled', { variant: 'success' });
              navigate('/orders');
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Cancel Order?"
        description={`This will cancel order "${order.orderNumber}". This action cannot be undone.`}
        isPending={isDeleting}
        confirmText="Cancel Order"
      />

      {/* View mode */}
      <div className="space-y-4">
        {/* Order Info Section */}
        <DetailSection title="Order Information">
          <DetailField label="Order Number" value={order.orderNumber} />
          <DetailField label="Status" value={order.status} />
          <DetailField label="Order Date" value={formatDate(order.orderDate)} />
          <DetailField label="Delivery Date" value={formatDate(order.deliveryDate)} />
          <DetailField label="Shipping Method" value={order.shippingMethod} />
          <DetailField label="Tracking Number" value={order.trackingNumber} />
        </DetailSection>

        {/* Account Section */}
        <DetailSection title="Account Information">
          <DetailField label="Account Name" value={order.account?.name} />
          <DetailField label="Account Type" value={order.account?.accountType} />
          <DetailField label="Contact Person" value={order.contactPerson} />
          <DetailField label="Phone" value={order.account?.phone} />
          <DetailField label="Email" value={order.account?.email} />
        </DetailSection>

        {/* Amounts Section */}
        <DetailSection title="Order Amounts">
          <DetailField label="Subtotal" value={formatCurrency(order.subtotal)} />
          <DetailField label="Discount Amount" value={formatCurrency(order.discountAmount)} />
          <DetailField label="Tax Amount" value={formatCurrency(order.taxAmount)} />
          <DetailField label="Total Amount" value={formatCurrency(order.totalAmount)} />
          {order.shippingCost && (
            <DetailField label="Shipping Cost" value={formatCurrency(order.shippingCost)} />
          )}
          {order.currency && (
            <DetailField label="Currency" value={order.currency} />
          )}
        </DetailSection>

        {/* Approval Section */}
        <DetailSection title="Approval Information">
          <DetailField label="Approval Status" value={order.approvalStatus} />
          <DetailField label="Approved By" value={order.approvedBy} />
          <DetailField label="Approved At" value={formatDateTime(order.approvedAt)} />
          {order.rejectionReason && (
            <DetailField label="Rejection Reason" value={order.rejectionReason} />
          )}
        </DetailSection>

        {/* Order Items Section - if items exist */}
        {order.items && order.items.length > 0 && (
          <div className="rounded-xl border bg-background p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-xs font-medium text-muted-foreground">
                  <tr>
                    <th className="pb-2 text-left">Product</th>
                    <th className="pb-2 text-right">Quantity</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-left">
                        <div>
                          <p className="font-medium text-foreground">{item.productName}</p>
                          {item.productCode && (
                            <p className="text-xs text-muted-foreground">{item.productCode}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes Section - if notes exist */}
        {order.notes && (
          <div className="rounded-xl border bg-background p-5 space-y-2">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Package className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              Notes
            </h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}

        {/* Timestamps Section */}
        <div className="rounded-xl border bg-background p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailField label="Created" value={formatDateTime(order.createdAt)} />
            <DetailField label="Last Updated" value={formatDateTime(order.updatedAt)} />
            {order.createdBy && <DetailField label="Created By" value={order.createdBy} />}
          </div>
        </div>
      </div>
    </div>
  );
}