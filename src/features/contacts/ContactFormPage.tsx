import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateContact } from '@/api/endpoints/contacts'
import { useAccounts } from '@/api/endpoints/accounts'
import type { CreateContactRequest } from '@/api/app-types'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormRow } from '@/components/shared/FormRow'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { contactSchema, type ContactFormData } from '@/schemas/contacts'

// ─── Sub-components ────────────────────────────────────────────────────────────
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ContactFormPage() {
  const navigate = useNavigate()
  const { mutate: createContact, isPending } = useCreateContact()

  // Fetch accounts for the picker — size=100 is enough for a dropdown
  const { data: accountsPage, isLoading: accountsLoading } = useAccounts(0, 100)
  const accounts = accountsPage?.content ?? []

  const contactTypeOptions = useConfigOptions('contact.type')
  const SALUTATIONS = ['Dr.', 'Mr.', 'Ms.', 'Mrs.', 'Prof.']
  const customerClassOptions = useConfigOptions('contact.customerClass')
  const adoptionStageOptions = useConfigOptions('contact.adoptionStage')
  const leadSourceOptions = useConfigOptions('contact.leadSource')
  const consentStatusOptions = useConfigOptions('contact.consentStatus')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      prescribingAuthority: false,
      adoptionStage: 'unaware',
    },
  })

  function onSubmit(data: ContactFormData) {
    const { consentConfirmedStatus, consentConfirmedDate, ...rest } = data

    // Build typed payload — required fields set directly, optional fields conditionally spread
    const payload: CreateContactRequest = {
      accountId:   rest.accountId,
      firstName:   rest.firstName,
      lastName:    rest.lastName,
      contactType: rest.contactType,
      ...(rest.middleName        ? { middleName:        rest.middleName }        : {}),
      ...(rest.salutation        ? { salutation:        rest.salutation }        : {}),
      ...(rest.title             ? { title:             rest.title }             : {}),
      ...(rest.specialty         ? { specialty:         rest.specialty }         : {}),
      ...(rest.email             ? { email:             rest.email }             : {}),
      ...(rest.phone             ? { phone:             rest.phone }             : {}),
      ...(rest.mobile            ? { mobile:            rest.mobile }            : {}),
      ...(rest.customerClass     ? { customerClass:     rest.customerClass }     : {}),
      ...(rest.adoptionStage     ? { adoptionStage:     rest.adoptionStage }     : {}),
      ...(rest.leadSource        ? { leadSource:        rest.leadSource }        : {}),
      ...(rest.preferredContactMethod ? { preferredContactMethod: rest.preferredContactMethod } : {}),
      ...(rest.preferredContactTime   ? { preferredContactTime:   rest.preferredContactTime }   : {}),
      ...(rest.prcNumber         ? { prcNumber:         rest.prcNumber }         : {}),
      ...(rest.npiNumber         ? { npiNumber:         rest.npiNumber }         : {}),
      ...(rest.deaNumber         ? { deaNumber:         rest.deaNumber }         : {}),
      ...(rest.stateLicenseNumber ? { stateLicenseNumber: rest.stateLicenseNumber } : {}),
      ...(rest.addressStreet     ? { addressStreet:     rest.addressStreet }     : {}),
      ...(rest.addressBarangay   ? { addressBarangay:   rest.addressBarangay }   : {}),
      ...(rest.addressCity       ? { addressCity:       rest.addressCity }       : {}),
      ...(rest.addressProvince   ? { addressProvince:   rest.addressProvince }   : {}),
      ...(rest.addressPostalCode ? { addressPostalCode: rest.addressPostalCode } : {}),
      ...(rest.notes             ? { notes:             rest.notes }             : {}),
      ...(rest.prescribingAuthority !== undefined ? { prescribingAuthority: rest.prescribingAuthority } : {}),
      ...(consentConfirmedStatus ? { consentStatus: consentConfirmedStatus }     : {}),
      ...(consentConfirmedDate   ? { consentDate:   consentConfirmedDate }       : {}),
    }

    createContact(payload, {
      onSuccess: (contact) => {
        toast('Contact created', { variant: 'success' })
        navigate(`/contacts/${contact.id}`)
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
        <PageHeader title="New Contact" description="Add a doctor, pharmacist, or other HCP" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Primary Account — required */}
        <FormSection title="Primary Account">
          <FormRow label="Account" required error={errors.accountId?.message} className="sm:col-span-2">
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={accountsLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={accountsLoading ? 'Loading accounts…' : 'Select account'} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id ?? ''}>
                        {a.name} — {a.accountType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
        </FormSection>

        {/* Basic Info */}
        <FormSection title="Basic Info">
          <FormRow label="Salutation" error={errors.salutation?.message}>
            <Controller
              name="salutation"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {SALUTATIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
            <Controller
              name="contactType"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {contactTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Specialty" error={errors.specialty?.message}>
            <Input {...register('specialty')} placeholder="e.g. Cardiology" />
          </FormRow>
          <FormRow label="Lead Source" error={errors.leadSource?.message}>
            <Controller
              name="leadSource"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    {leadSourceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
          <FormRow label="Preferred Contact Method" error={errors.preferredContactMethod?.message}>
            <Input {...register('preferredContactMethod')} placeholder="e.g. email, phone" />
          </FormRow>
          <FormRow label="Preferred Contact Time" error={errors.preferredContactTime?.message}>
            <Input {...register('preferredContactTime')} placeholder="e.g. mornings, after 5pm" />
          </FormRow>
        </FormSection>

        {/* Segmentation */}
        <FormSection title="Segmentation">
          <FormRow label="Customer Class" error={errors.customerClass?.message}>
            <Controller
              name="customerClass"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    {customerClassOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Adoption Stage" error={errors.adoptionStage?.message}>
            <Controller
              name="adoptionStage"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>
                    {adoptionStageOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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

        {/* Licensing */}
        <FormSection title="Licensing & Credentials">
          <FormRow label="NPI Number" error={errors.npiNumber?.message}>
            <Input {...register('npiNumber')} />
          </FormRow>
          <FormRow label="DEA Number" error={errors.deaNumber?.message}>
            <Input {...register('deaNumber')} />
          </FormRow>
          <FormRow label="State License Number" error={errors.stateLicenseNumber?.message}>
            <Input {...register('stateLicenseNumber')} />
          </FormRow>
        </FormSection>

        {/* Consent */}
        <FormSection title="Consent & Compliance">
          <FormRow label="Consent Status" error={errors.consentConfirmedStatus?.message}>
            <Controller
              name="consentConfirmedStatus"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {consentStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Consent Date" error={errors.consentConfirmedDate?.message}>
            <Input {...register('consentConfirmedDate')} type="date" />
          </FormRow>
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
          <Textarea
            {...register('notes')}
            rows={3}
            placeholder="Any additional notes about this contact…"
          />
        </div>

        {/* Sticky footer — always visible regardless of form length */}
        <div className="sticky bottom-0 -mx-6 border-t bg-background px-6 py-3 flex items-center justify-end gap-2">
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
