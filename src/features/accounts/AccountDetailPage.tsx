import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, X, Check, Globe, Phone, Mail, Building2, Trash2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAccount, useUpdateAccount, useDeleteAccount } from '@/api/endpoints/accounts'
import { useRole } from '@/hooks/useRole'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatCurrency, formatLabel, formatNumber } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { accountEditSchema, type AccountEditFormData } from '@/schemas/accounts'

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

function FormRow({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
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
  const { mutate: updateAccount, isPending } = useUpdateAccount(id ?? '')
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount()
  const { isManager } = useRole()
  const accountTypeOptions = useConfigOptions('account.type')
  const accountStatusOptions = useConfigOptions('account.status')

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AccountEditFormData>({
    resolver: zodResolver(accountEditSchema),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError || !account) return <ErrorMessage message="Account not found." />

  function startEdit() {
    reset({
      name: account?.name ?? '',
      accountType: account?.accountType ?? undefined,
      billingAddress: account?.billingAddress ?? '',
      shippingAddress: account?.shippingAddress ?? '',
      taxId: account?.taxId ?? '',
      creditLimit: account?.creditLimit != null ? Number(account.creditLimit) : undefined,
      paymentTerms: account?.paymentTerms ?? '',
      status: account?.status ?? undefined,
      deaNumber: account?.deaNumber ?? '',
      stateLicenseNumber: account?.stateLicenseNumber ?? '',
      controlledSubstanceApproved: account?.controlledSubstanceApproved ?? false,
    })
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    reset()
  }

  function onSubmit(data: AccountEditFormData) {
    updateAccount(data, {
      onSuccess: () => {
        toast('Account updated', { variant: 'success' })
        setEditing(false)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

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
            <StatusBadge status={(account.status ?? 'active').toUpperCase()} />
            {account.isSupplier && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <Building2 className="h-3 w-3" />
                Supplier
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {account.accountType && <span>{formatLabel(account.accountType)}</span>}
            {account.owner?.fullName && (
              <>
                <span>·</span>
                <span>{account.owner.fullName}</span>
              </>
            )}
            {account.parentAccount?.name && (
              <>
                <span>·</span>
                <span>{account.parentAccount.name}</span>
              </>
            )}
          </div>
        </div>

        {!editing && isManager && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
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

      {/* View mode */}
      {!editing && (
        <div className="space-y-4">
          <DetailSection title="Account Info">
            <DetailField label="Account Type" value={formatLabel(account.accountType)} />
            <DetailField label="Customer Code" value={account.customerCode} />
            <DetailField label="Primary Customer Class" value={account.primaryCustomerClass} />
            <DetailField label="Owner" value={account.owner?.fullName} />
            <DetailField label="Parent Account" value={account.parentAccount?.name} />
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

      {/* Edit mode */}
      {editing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-xl border bg-background p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Account Info</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="Name" error={errors.name?.message}>
                <Input {...register('name')} />
              </FormRow>
              <FormRow label="Account Type" error={errors.accountType?.message}>
                <Controller
                  name="accountType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {accountTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormRow>
              <FormRow label="Status" error={errors.status?.message}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        {accountStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormRow>
              <FormRow label="Payment Terms" error={errors.paymentTerms?.message}>
                <Input {...register('paymentTerms')} placeholder="e.g. NET30" />
              </FormRow>
            </div>
          </div>

          <div className="rounded-xl border bg-background p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Financials</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="Credit Limit" error={errors.creditLimit?.message}>
                <Input {...register('creditLimit')} type="number" min={0} step={0.01} />
              </FormRow>
              <FormRow label="Tax ID" error={errors.taxId?.message}>
                <Input {...register('taxId')} />
              </FormRow>
            </div>
          </div>

          <div className="rounded-xl border bg-background p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Addresses</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="Billing Address" error={errors.billingAddress?.message}>
                <Input {...register('billingAddress')} />
              </FormRow>
              <FormRow label="Shipping Address" error={errors.shippingAddress?.message}>
                <Input {...register('shippingAddress')} />
              </FormRow>
            </div>
          </div>

          <div className="rounded-xl border bg-background p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Compliance & Licensing</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="DEA Number" error={errors.deaNumber?.message}>
                <Input {...register('deaNumber')} />
              </FormRow>
              <FormRow label="State License Number" error={errors.stateLicenseNumber?.message}>
                <Input {...register('stateLicenseNumber')} />
              </FormRow>
              <div className="flex items-center gap-2 pt-1 sm:col-span-2">
                <input
                  type="checkbox"
                  id="controlledSubstanceApproved"
                  {...register('controlledSubstanceApproved')}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <Label htmlFor="controlledSubstanceApproved" className="text-sm text-foreground cursor-pointer">
                  Controlled Substance Approved
                </Label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button type="button" variant="outline" onClick={cancelEdit} disabled={isPending}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
