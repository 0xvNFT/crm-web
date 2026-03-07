import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateContact } from '@/api/endpoints/contacts'
import { useAccounts } from '@/api/endpoints/accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/shared/PageHeader'

// ─── Schema ───────────────────────────────────────────────────────────────────
const contactSchema = z.object({
  // Required
  accountId: z.string().min(1, 'Primary account is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactType: z.enum(
    ['physician', 'pharmacist', 'nurse_practitioner', 'physician_assistant', 'administrator', 'buyer', 'other'],
    { errorMap: () => ({ message: 'Contact type is required' }) }
  ),
  // Optional
  salutation: z.string().optional(),
  middleName: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  specialty: z.string().optional(),
  customerClass: z.string().optional(),
  adoptionStage: z.enum(['unaware', 'aware', 'user', 'advocate', 'champion']).optional(),
  prescribingAuthority: z.boolean().optional(),
  prcNumber: z.string().optional(),
  leadSource: z.string().optional(),
  addressStreet: z.string().optional(),
  addressBarangay: z.string().optional(),
  addressCity: z.string().optional(),
  addressProvince: z.string().optional(),
  addressPostalCode: z.string().optional(),
  notes: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

// ─── Sub-components ────────────────────────────────────────────────────────────
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function FormRow({ label, required, error, className, children }: {
  label: string
  required?: boolean
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ContactFormPage() {
  const navigate = useNavigate()
  const { mutate: createContact, isPending } = useCreateContact()

  // Fetch accounts for the picker — size=100 is enough for a dropdown
  const { data: accountsPage, isLoading: accountsLoading } = useAccounts(0, 100)
  const accounts = accountsPage?.content ?? []

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      prescribingAuthority: false,
      adoptionStage: 'unaware',
    },
  })

  function onSubmit(data: ContactFormData) {
    const { accountId, email, ...rest } = data

    // Build payload matching PharmaContact shape the backend expects
    const payload = {
      ...rest,
      account: { id: accountId },
      // Strip empty email so backend doesn't try to persist an empty string
      ...(email ? { email } : {}),
    }

    // Remove keys with empty string / undefined values
    const clean = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== '' && v !== undefined)
    )

    createContact(clean, {
      onSuccess: (contact) => navigate(`/contacts/${contact.id}`),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="New Contact" description="Add a doctor, pharmacist, or other HCP" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Primary Account — required */}
        <FormSection title="Primary Account">
          <FormRow label="Account" required error={errors.accountId?.message} className="sm:col-span-2">
            <select
              {...register('accountId')}
              disabled={accountsLoading}
              className={SELECT_CLASS}
            >
              <option value="">{accountsLoading ? 'Loading accounts…' : 'Select account'}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.accountType}
                </option>
              ))}
            </select>
          </FormRow>
        </FormSection>

        {/* Basic Info */}
        <FormSection title="Basic Info">
          <FormRow label="Salutation" error={errors.salutation?.message}>
            <select {...register('salutation')} className={SELECT_CLASS}>
              <option value="">None</option>
              <option value="Dr.">Dr.</option>
              <option value="Mr.">Mr.</option>
              <option value="Ms.">Ms.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Prof.">Prof.</option>
            </select>
          </FormRow>
          <FormRow label="First Name" required error={errors.firstName?.message}>
            <Input {...register('firstName')} autoFocus />
          </FormRow>
          <FormRow label="Middle Name" error={errors.middleName?.message}>
            <Input {...register('middleName')} />
          </FormRow>
          <FormRow label="Last Name" required error={errors.lastName?.message}>
            <Input {...register('lastName')} />
          </FormRow>
          <FormRow label="Title / Position" error={errors.title?.message}>
            <Input {...register('title')} placeholder="e.g. Cardiologist" />
          </FormRow>
          <FormRow label="Contact Type" required error={errors.contactType?.message}>
            <select {...register('contactType')} className={SELECT_CLASS}>
              <option value="">Select type</option>
              <option value="physician">Physician</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="nurse_practitioner">Nurse Practitioner</option>
              <option value="physician_assistant">Physician Assistant</option>
              <option value="administrator">Administrator</option>
              <option value="buyer">Buyer</option>
              <option value="other">Other</option>
            </select>
          </FormRow>
          <FormRow label="Specialty" error={errors.specialty?.message}>
            <Input {...register('specialty')} placeholder="e.g. Cardiology" />
          </FormRow>
          <FormRow label="Lead Source" error={errors.leadSource?.message}>
            <Input {...register('leadSource')} placeholder="e.g. Referral, Event" />
          </FormRow>
        </FormSection>

        {/* Contact Details */}
        <FormSection title="Contact Details">
          <FormRow label="Email" error={errors.email?.message}>
            <Input {...register('email')} type="email" />
          </FormRow>
          <FormRow label="Mobile" error={errors.mobile?.message}>
            <Input {...register('mobile')} type="tel" />
          </FormRow>
          <FormRow label="Phone" error={errors.phone?.message}>
            <Input {...register('phone')} type="tel" />
          </FormRow>
        </FormSection>

        {/* Segmentation */}
        <FormSection title="Segmentation">
          <FormRow label="Customer Class" error={errors.customerClass?.message}>
            <select {...register('customerClass')} className={SELECT_CLASS}>
              <option value="">None</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </FormRow>
          <FormRow label="Adoption Stage" error={errors.adoptionStage?.message}>
            <select {...register('adoptionStage')} className={SELECT_CLASS}>
              <option value="unaware">Unaware</option>
              <option value="aware">Aware</option>
              <option value="user">User</option>
              <option value="advocate">Advocate</option>
              <option value="champion">Champion</option>
            </select>
          </FormRow>
          <FormRow label="PRC Number" error={errors.prcNumber?.message}>
            <Input {...register('prcNumber')} />
          </FormRow>
          <div className="flex items-center gap-2 pt-1 sm:col-span-2">
            <input
              type="checkbox"
              id="prescribingAuthority"
              {...register('prescribingAuthority')}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <Label htmlFor="prescribingAuthority" className="text-sm text-foreground cursor-pointer">
              Prescribing Authority
            </Label>
          </div>
        </FormSection>

        {/* Address */}
        <FormSection title="Address">
          <FormRow label="Street" error={errors.addressStreet?.message}>
            <Input {...register('addressStreet')} />
          </FormRow>
          <FormRow label="Barangay" error={errors.addressBarangay?.message}>
            <Input {...register('addressBarangay')} />
          </FormRow>
          <FormRow label="City" error={errors.addressCity?.message}>
            <Input {...register('addressCity')} />
          </FormRow>
          <FormRow label="Province" error={errors.addressProvince?.message}>
            <Input {...register('addressProvince')} />
          </FormRow>
          <FormRow label="Postal Code" error={errors.addressPostalCode?.message}>
            <Input {...register('addressPostalCode')} />
          </FormRow>
        </FormSection>

        {/* Notes */}
        <div className="rounded-xl border bg-background p-5 space-y-2">
          <Label className="text-sm font-semibold text-foreground">Notes</Label>
          <textarea
            {...register('notes')}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            placeholder="Any additional notes about this contact…"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || accountsLoading}>
            {isPending ? 'Creating…' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  )
}
