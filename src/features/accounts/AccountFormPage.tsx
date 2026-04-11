import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateAccount, useAccountSearch } from '@/api/endpoints/accounts'
import { useStaffSearch } from '@/api/endpoints/users'
import { useDebounce } from '@/hooks/useDebounce'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckboxField } from '@/components/shared/CheckboxField'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormRow } from '@/components/shared/FormRow'
import { FormSection } from '@/components/shared/FormSection'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { accountSchema, type AccountFormData } from '@/schemas/accounts'
import type { CreatePharmaAccountRequest } from '@/api/app-types'

export default function AccountFormPage() {
  const navigate = useNavigate()
  const { mutate: createAccount, isPending } = useCreateAccount()

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

  const ownerOptions: ComboboxOption[] = (ownerResults ?? []).filter((u) => u.id).map((u) => ({
    value: u.id!,
    label: u.fullName ?? u.email ?? u.id!,
  }))
  const parentOptions: ComboboxOption[] = (parentResults ?? []).filter((a) => a.id).map((a) => ({
    value: a.id!,
    label: a.name ?? a.id!,
  }))

  const { register, handleSubmit, control, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { controlledSubstanceApproved: false, isSupplier: false },
  })

  function onSubmit(data: AccountFormData) {
    // Strip empty strings so backend doesn't receive ""
    // Why: Object.fromEntries loses static type info; shape is guaranteed by Zod accountSchema
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
    ) as CreatePharmaAccountRequest
    createAccount(payload, {
      onSuccess: (account) => {
        toast('Account created', { variant: 'success' })
        navigate(`/accounts/${account.id}`)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="New Account" description="Add a hospital, pharmacy, clinic, or distributor" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Account Info">
          <FormRow label="Account Name" required error={errors.name?.message}>
            <Input {...register('name')} placeholder="e.g. St. Luke's Medical Center" autoFocus />
          </FormRow>
          <FormRow label="Account Type" required error={errors.accountType?.message}>
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
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
        </FormSection>

        <FormSection title="Contact Info">
          <FormRow label="Phone" error={errors.phoneMain?.message}>
            <Input {...register('phoneMain')} type="tel" placeholder="+63 2 1234 5678" />
          </FormRow>
          <FormRow label="Email" error={errors.emailGeneral?.message}>
            <Input {...register('emailGeneral')} type="email" placeholder="info@example.com" />
          </FormRow>
          <FormRow label="Website" error={errors.website?.message}>
            <Input {...register('website')} type="url" placeholder="https://example.com" />
          </FormRow>
        </FormSection>

        <FormSection title="Assignment">
          <FormRow label="Owner" error={errors.ownerId?.message}>
            <Controller
              name="ownerId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={ownerOptions}
                  placeholder="Search staff…"
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
                  placeholder="Search accounts…"
                  onSearchChange={setParentQuery}
                  isLoading={isSearchingParents}
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Financials">
          <FormRow label="Annual Revenue" error={errors.annualRevenue?.message}>
            <Input {...register('annualRevenue')} type="number" min={0} step={0.01} placeholder="0.00" />
          </FormRow>
          <FormRow label="Employees" error={errors.employees?.message}>
            <Input {...register('employees')} type="number" min={0} step={1} placeholder="0" />
          </FormRow>
          <FormRow label="Credit Limit" error={errors.creditLimit?.message}>
            <Input {...register('creditLimit')} type="number" min={0} step={0.01} placeholder="0.00" />
          </FormRow>
          <FormRow label="Payment Terms" error={errors.paymentTerms?.message}>
            <Controller
              name="paymentTerms"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
          <FormRow label="Tax ID" error={errors.taxId?.message}>
            <Input {...register('taxId')} />
          </FormRow>
          <CheckboxField label="Is Supplier" id="isSupplier" {...register('isSupplier')} />
        </FormSection>

        <FormSection title="Addresses">
          <FormRow label="Billing Address" error={errors.billingAddress?.message}>
            <Input {...register('billingAddress')} />
          </FormRow>
          <FormRow label="Shipping Address" error={errors.shippingAddress?.message}>
            <Input {...register('shippingAddress')} />
          </FormRow>
        </FormSection>

        <FormSection title="Compliance & Licensing">
          <FormRow label="DEA Number" error={errors.deaNumber?.message}>
            <Input {...register('deaNumber')} />
          </FormRow>
          <FormRow label="State License Number" error={errors.stateLicenseNumber?.message}>
            <Input {...register('stateLicenseNumber')} />
          </FormRow>
          <CheckboxField label="Controlled Substance Approved" id="controlledSubstanceApproved" className="sm:col-span-2" {...register('controlledSubstanceApproved')} />
        </FormSection>

        {/* Sticky footer */}
        <div className="sticky bottom-0 -mx-6 border-t bg-background px-6 py-3 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating…' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  )
}
