import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateAccount } from '@/api/endpoints/accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'

const accountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters'),
  accountType: z.enum(['hospital', 'pharmacy', 'clinic', 'distributor'], {
    error: 'Account type is required',
  }),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative('Must be 0 or greater').optional(),
  paymentTerms: z.string().optional(),
  deaNumber: z.string().optional(),
  stateLicenseNumber: z.string().optional(),
  controlledSubstanceApproved: z.boolean().optional(),
})

type AccountFormData = z.infer<typeof accountSchema>

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function FormRow({ label, required, error, children }: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function AccountFormPage() {
  const navigate = useNavigate()
  const { mutate: createAccount, isPending } = useCreateAccount()

  const { register, handleSubmit, control, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { controlledSubstanceApproved: false },
  })

  function onSubmit(data: AccountFormData) {
    createAccount(data, {
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
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Payment Terms" error={errors.paymentTerms?.message}>
            <Input {...register('paymentTerms')} placeholder="e.g. NET30" />
          </FormRow>
          <FormRow label="Tax ID" error={errors.taxId?.message}>
            <Input {...register('taxId')} />
          </FormRow>
        </FormSection>

        <FormSection title="Financials">
          <FormRow label="Credit Limit" error={errors.creditLimit?.message}>
            <Input {...register('creditLimit')} type="number" min={0} step={0.01} placeholder="0.00" />
          </FormRow>
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
        </FormSection>

        {/* Sticky footer — always visible regardless of form length */}
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
