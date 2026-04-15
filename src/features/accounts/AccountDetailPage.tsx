import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Globe, Phone, Mail, Building2, Trash2, UserPlus } from 'lucide-react'
import { useAccount, useDeleteAccount } from '@/api/endpoints/accounts'
import { useRole } from '@/hooks/useRole'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency, formatLabel, formatNumber } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { AccountEditForm } from './components/AccountEditForm'
import { AccountOpportunitiesSection } from './components/AccountOpportunitiesSection'
import { AccountInvoicesSection } from './components/AccountInvoicesSection'
import { AccountVisitsSection } from './components/AccountVisitsSection'
import { AccountActivitiesSection } from './components/AccountActivitiesSection'
import { EntityHistorySection } from '@/components/shared/EntityHistorySection'
import { EntityNotesSection } from '@/components/shared/EntityNotesSection'
import { EntityTagsSection } from '@/components/shared/EntityTagsSection'

// ─── Sub-components ────────────────────────────────────────────────────────────
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
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
export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const { data: account, isLoading, isError } = useAccount(id ?? '')
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount()
  const { isManager, isReadOnly } = useRole()

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !account) return <ErrorMessage message="Account not found." />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{account.name}</h1>
            <StatusBadge status={account.status ?? 'active'} />
            {account.isSupplier && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <Building2 className="h-3 w-3" />
                Supplier
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {account.accountType && <span>{formatLabel(account.accountType)}</span>}
            {account.ownerName && (
              <>
                <span>·</span>
                <span>{account.ownerName}</span>
              </>
            )}
            {account.parentAccountName && (
              <>
                <span>·</span>
                <span>{account.parentAccountName}</span>
              </>
            )}
          </div>
        </div>

        {!editing && !isReadOnly && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate('/leads/new', { state: { accountId: account.id, companyName: account.name } })}>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
              Create Lead
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            {isManager && (
              <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Quick contact strip */}
      <div className="flex flex-wrap gap-3">
        {account.phoneMain && (
          <a
            href={`tel:${account.phoneMain}`}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            {account.phoneMain}
          </a>
        )}
        {account.emailGeneral && (
          <a
            href={`mailto:${account.emailGeneral}`}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            {account.emailGeneral}
          </a>
        )}
        {account.website && (
          <a
            href={account.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Globe className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            {account.website}
          </a>
        )}
      </div>

      {/* Edit mode */}
      {editing && (
        <AccountEditForm
          accountId={id ?? ''}
          account={account}
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* View mode */}
      {!editing && (
        <div className="space-y-4">
          <DetailSection title="Account Info">
            <DetailField label="Account Type" value={formatLabel(account.accountType)} />
            <DetailField label="Customer Code" value={account.customerCode} />
            <DetailField label="Primary Customer Class" value={account.primaryCustomerClass} />
            <DetailField label="Owner" value={account.ownerName} />
            <DetailField label="Parent Account" value={account.parentAccountName} />
            <DetailField label="Is Supplier" value={account.isSupplier} />
          </DetailSection>

          <DetailSection title="Financials">
            <DetailField label="Credit Limit" value={account.creditLimit != null ? formatCurrency(account.creditLimit) : undefined} />
            <DetailField label="Payment Terms" value={account.paymentTerms} />
            <DetailField label="Annual Revenue" value={account.annualRevenue != null ? formatCurrency(account.annualRevenue) : undefined} />
            <DetailField label="Employees" value={account.employees != null ? formatNumber(account.employees) : undefined} />
            <DetailField label="Tax ID" value={account.taxId} />
          </DetailSection>

          <DetailSection title="Addresses">
            <DetailField label="Billing Address" value={account.billingAddress} />
            <DetailField label="Shipping Address" value={account.shippingAddress} />
          </DetailSection>

          <DetailSection title="Compliance & Licensing">
            <DetailField label="DEA Number" value={account.deaNumber} />
            <DetailField label="State License" value={account.stateLicenseNumber} />
            <DetailField label="Controlled Substance Approved" value={account.controlledSubstanceApproved} />
          </DetailSection>

          <DetailSection title="HCP Coverage">
            <DetailField label="Total HCPs" value={account.totalHcpCount} />
            <DetailField label="Advocate HCPs" value={account.advocateHcpCount} />
            <DetailField label="User HCPs" value={account.userHcpCount} />
          </DetailSection>

          <div className="rounded-xl border bg-background p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DetailField label="Account ID" value={account.id} />
              <DetailField label="Created" value={formatDate(account.createdAt)} />
              <DetailField label="Last Updated" value={formatDate(account.updatedAt)} />
            </div>
          </div>

          <AccountOpportunitiesSection accountId={id ?? ''} />
          <AccountInvoicesSection accountId={id ?? ''} />
          <AccountVisitsSection accountId={id ?? ''} />
          <AccountActivitiesSection accountId={id ?? ''} />
          <EntityTagsSection entityType="PharmaAccount" entityId={id ?? ''} />
          <EntityNotesSection entityType="PharmaAccount" entityId={id ?? ''} />
          <EntityHistorySection entityType="PharmaAccount" entityId={id ?? ''} />
        </div>
      )}

      <ConfirmDialog
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={() =>
          deleteAccount(id ?? '', {
            onSuccess: () => {
              toast('Account deleted', { variant: 'success' })
              navigate('/accounts')
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Delete Account?"
        description={`This will permanently delete "${account.name}" and all associated data. This cannot be undone.`}
        isPending={isDeleting}
      />
    </div>
  )
}
