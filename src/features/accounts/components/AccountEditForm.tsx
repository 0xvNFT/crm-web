import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Check } from 'lucide-react'
import { useUpdateAccount, useAccountSearch } from '@/api/endpoints/accounts'
import { useStaffSearch } from '@/api/endpoints/users'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useDebounce } from '@/hooks/useDebounce'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormRow } from '@/components/shared/FormRow'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { accountEditSchema, type AccountEditFormData } from '@/schemas/accounts'
import type { PharmaAccount, UpdatePharmaAccountRequest } from '@/api/app-types'

interface AccountEditFormProps {
  accountId: string
  account: PharmaAccount
  onSuccess: () => void
  onCancel: () => void
}

export function AccountEditForm({ accountId, account, onSuccess, onCancel }: AccountEditFormProps) {
  const { mutate: updateAccount, isPending } = useUpdateAccount(accountId)
  const accountTypeOptions = useConfigOptions('account.type')
  const accountStatusOptions = useConfigOptions('account.status')
  const customerClassOptions = useConfigOptions('account.customerClass')
  const paymentTermsOptions = useConfigOptions('paymentTerms')

  const [ownerQuery, setOwnerQuery] = useState('')
  const [parentQuery, setParentQuery] = useState('')
  const debouncedOwnerQuery = useDebounce(ownerQuery, 300)
  const debouncedParentQuery = useDebounce(parentQuery, 300)

  const { data: ownerResults, isLoading: isSearchingOwners } = useStaffSearch(debouncedOwnerQuery)
  const { data: parentResults, isLoading: isSearchingParents } = useAccountSearch(debouncedParentQuery)

  const ownerOptions = (ownerResults ?? []).filter((u) => u.id).map((u) => ({ value: u.id!, label: u.fullName ?? u.email ?? u.id! }))
  const parentOptions = (parentResults ?? []).filter((a) => a.id && a.id !== accountId).map((a) => ({ value: a.id!, label: a.name ?? a.id! }))

  // Seed the label for the current value before the user searches
  const selectedOwnerOption: ComboboxOption | undefined = account.ownerId
    ? { value: account.ownerId, label: account.ownerName ?? '' }
    : undefined
  const selectedParentOption: ComboboxOption | undefined = account.parentAccountId
    ? { value: account.parentAccountId, label: account.parentAccountName ?? '' }
    : undefined

  const { register, handleSubmit, control, formState: { errors } } = useForm<AccountEditFormData>({
    resolver: zodResolver(accountEditSchema),
    defaultValues: {
      name:                        account.name                        ?? '',
      accountType:                 account.accountType                 ?? undefined,
      status:                      account.status                      ?? undefined,
      ownerId:                     account.ownerId                     ?? undefined,
      parentAccountId:             account.parentAccountId             ?? undefined,
      website:                     account.website                     ?? '',
      phoneMain:                   account.phoneMain                   ?? '',
      emailGeneral:                account.emailGeneral                ?? '',
      primaryCustomerClass:        account.primaryCustomerClass        ?? undefined,
      annualRevenue:               account.annualRevenue != null ? Number(account.annualRevenue) : undefined,
      employees:                   account.employees    != null ? Number(account.employees)    : undefined,
      isSupplier:                  account.isSupplier                  ?? false,
      creditLimit:                 account.creditLimit  != null ? Number(account.creditLimit)  : undefined,
      paymentTerms:                account.paymentTerms                ?? '',
      taxId:                       account.taxId                       ?? '',
      billingAddress:              account.billingAddress              ?? '',
      shippingAddress:             account.shippingAddress             ?? '',
      deaNumber:                   account.deaNumber                   ?? '',
      stateLicenseNumber:          account.stateLicenseNumber          ?? '',
      controlledSubstanceApproved: account.controlledSubstanceApproved ?? false,
    },
  })

  function onSubmit(data: AccountEditFormData) {
    // Strip empty strings so backend doesn't receive "" for URL/email/optional fields
    // Why: Object.fromEntries loses static type info; shape is guaranteed by Zod accountEditSchema
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
    ) as UpdatePharmaAccountRequest
    updateAccount(payload, {
      onSuccess: () => {
        toast('Account updated', { variant: 'success' })
        onSuccess()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
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
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
          <FormRow label="Customer Class" error={errors.primaryCustomerClass?.message}>
            <Controller
              name="primaryCustomerClass"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {customerClassOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Owner (Rep)" error={errors.ownerId?.message}>
            <Controller
              name="ownerId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={ownerOptions}
                  selectedOption={selectedOwnerOption}
                  placeholder="Search rep..."
                  searchPlaceholder="Type name..."
                  onSearchChange={setOwnerQuery}
                  isLoading={isSearchingOwners}
                />
              )}
            />
          </FormRow>
          <FormRow label="Parent Account" error={errors.parentAccountId?.message}>
            <Controller
              name="parentAccountId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={parentOptions}
                  selectedOption={selectedParentOption}
                  placeholder="Search account..."
                  searchPlaceholder="Type account name..."
                  onSearchChange={setParentQuery}
                  isLoading={isSearchingParents}
                />
              )}
            />
          </FormRow>
          <div className="flex items-center gap-2 pt-1 sm:col-span-2">
            <input
              type="checkbox"
              id="isSupplier"
              {...register('isSupplier')}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <Label htmlFor="isSupplier" className="text-sm text-foreground cursor-pointer">
              Is Supplier
            </Label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Contact Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormRow label="Phone" error={errors.phoneMain?.message}>
            <Input {...register('phoneMain')} placeholder="+63 2 8XXX XXXX" />
          </FormRow>
          <FormRow label="Email" error={errors.emailGeneral?.message}>
            <Input {...register('emailGeneral')} placeholder="contact@hospital.com" />
          </FormRow>
          <FormRow label="Website" error={errors.website?.message} className="sm:col-span-2">
            <Input {...register('website')} placeholder="https://..." />
          </FormRow>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Financials</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormRow label="Credit Limit" error={errors.creditLimit?.message}>
            <Input {...register('creditLimit')} type="number" min={0} step={0.01} />
          </FormRow>
          <FormRow label="Payment Terms" error={errors.paymentTerms?.message}>
            <Controller
              name="paymentTerms"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select terms" /></SelectTrigger>
                  <SelectContent>
                    {paymentTermsOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Annual Revenue" error={errors.annualRevenue?.message}>
            <Input {...register('annualRevenue')} type="number" min={0} step={0.01} />
          </FormRow>
          <FormRow label="Employees" error={errors.employees?.message}>
            <Input {...register('employees')} type="number" min={0} />
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          <X className="h-3.5 w-3.5 mr-1.5" />
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <Check className="h-3.5 w-3.5 mr-1.5" />
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
