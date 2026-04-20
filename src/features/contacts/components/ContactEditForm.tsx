import { useForm, Controller } from 'react-hook-form'
import { PhAddressFields } from '@/components/shared/PhAddressFields'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Check } from 'lucide-react'
import { useUpdateContact } from '@/api/endpoints/contacts'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter'
import { CheckboxField } from '@/components/shared/CheckboxField'
import { FormRow } from '@/components/shared/FormRow'
import { FormSection } from '@/components/shared/FormSection'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { contactEditSchema, type ContactEditFormData } from '@/schemas/contacts'
import type { PharmaContact, UpdateContactRequest } from '@/api/app-types'

interface ContactEditFormProps {
  contactId: string
  contact: PharmaContact
  onSuccess: () => void
  onCancel: () => void
}

export function ContactEditForm({ contactId, contact, onSuccess, onCancel }: ContactEditFormProps) {
  const { mutate: updateContact, isPending } = useUpdateContact(contactId)
  const { isReadOnly } = useRole()
  const contactTypeOptions = useConfigOptions('contact.type')
  const contactStatusOptions = useConfigOptions('contact.status')
  const consentStatusOptions = useConfigOptions('contact.consentStatus')
  const customerClassOptions = useConfigOptions('contact.customerClass')
  const adoptionStageOptions = useConfigOptions('contact.adoptionStage')
  const leadSourceOptions = useConfigOptions('contact.leadSource')

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<ContactEditFormData>({
    resolver: zodResolver(contactEditSchema),
    defaultValues: {
      firstName:              contact.firstName              ?? '',
      lastName:               contact.lastName               ?? '',
      title:                  contact.title                  ?? '',
      email:                  contact.email                  ?? '',
      phone:                  contact.phone                  ?? '',
      mobile:                 contact.mobile                 ?? '',
      contactType:            contact.contactType            ?? undefined,
      specialty:              contact.specialty              ?? '',
      customerClass:          contact.customerClass          ?? undefined,
      adoptionStage:          contact.adoptionStage          ?? undefined,
      leadSource:             contact.leadSource             ?? undefined,
      professionalSociety:    contact.professionalSociety    ?? '',
      npiNumber:              contact.npiNumber              ?? '',
      deaNumber:              contact.deaNumber              ?? '',
      stateLicenseNumber:     contact.stateLicenseNumber     ?? '',
      prcNumber:              contact.prcNumber              ?? '',
      prcExpiryDate:          contact.prcExpiryDate          ?? '',
      prescribingAuthority:   contact.prescribingAuthority   ?? false,
      doNotCall:              contact.doNotCall              ?? false,
      emailOptOut:            contact.emailOptOut            ?? false,
      yearsOfExperience:      contact.yearsOfExperience      ?? undefined,
      patientVolumeMonthly:   contact.patientVolumeMonthly   ?? undefined,
      preferredContactMethod: contact.preferredContactMethod ?? '',
      preferredContactTime:   contact.preferredContactTime   ?? '',
      status:                 contact.status                 ?? 'active',
      consentConfirmedStatus: contact.consentConfirmedStatus ?? undefined,
      consentConfirmedDate:   contact.consentConfirmedDate   ?? '',
      addressStreet:          contact.addressStreet          ?? '',
      addressRegion:          contact.addressRegion          ?? undefined,
      addressProvince:        contact.addressProvince        ?? undefined,
      addressCity:            contact.addressCity            ?? undefined,
      addressBarangay:        contact.addressBarangay        ?? undefined,
      addressPostalCode:      contact.addressPostalCode      ?? '',
      notes:                  contact.notes                  ?? '',
    },
  })

  // Belt-and-suspenders: callers enforce this but READ_ONLY must never see the edit form
  if (isReadOnly) return null

  function onSubmit(data: ContactEditFormData) {
    const { consentConfirmedStatus, consentConfirmedDate, ...rest } = data

    const payload: UpdateContactRequest = {
      ...(rest.firstName           ? { firstName:           rest.firstName }           : {}),
      ...(rest.lastName            ? { lastName:            rest.lastName }            : {}),
      ...(rest.title               ? { title:               rest.title }               : {}),
      ...(rest.email               ? { email:               rest.email }               : {}),
      ...(rest.phone               ? { phone:               rest.phone }               : {}),
      ...(rest.mobile              ? { mobile:              rest.mobile }              : {}),
      ...(rest.contactType         ? { contactType:         rest.contactType }         : {}),
      ...(rest.specialty           ? { specialty:           rest.specialty }           : {}),
      ...(rest.customerClass       ? { customerClass:       rest.customerClass }       : {}),
      ...(rest.adoptionStage       ? { adoptionStage:       rest.adoptionStage }       : {}),
      ...(rest.leadSource          ? { leadSource:          rest.leadSource }          : {}),
      ...(rest.professionalSociety ? { professionalSociety: rest.professionalSociety } : {}),
      ...(rest.npiNumber           ? { npiNumber:           rest.npiNumber }           : {}),
      ...(rest.deaNumber           ? { deaNumber:           rest.deaNumber }           : {}),
      ...(rest.stateLicenseNumber  ? { stateLicenseNumber:  rest.stateLicenseNumber }  : {}),
      ...(rest.prcNumber           ? { prcNumber:           rest.prcNumber }           : {}),
      ...(rest.prcExpiryDate       ? { prcExpiryDate:       rest.prcExpiryDate }       : {}),
      ...(rest.preferredContactMethod ? { preferredContactMethod: rest.preferredContactMethod } : {}),
      ...(rest.preferredContactTime   ? { preferredContactTime:   rest.preferredContactTime }   : {}),
      ...(rest.status              ? { status:              rest.status }              : {}),
      ...(rest.notes               ? { notes:               rest.notes }               : {}),
      ...(rest.yearsOfExperience   !== undefined ? { yearsOfExperience:   rest.yearsOfExperience }   : {}),
      ...(rest.patientVolumeMonthly !== undefined ? { patientVolumeMonthly: rest.patientVolumeMonthly } : {}),
      ...(rest.prescribingAuthority !== undefined ? { prescribingAuthority: rest.prescribingAuthority } : {}),
      ...(rest.doNotCall            !== undefined ? { doNotCall:            rest.doNotCall }            : {}),
      ...(rest.emailOptOut          !== undefined ? { emailOptOut:          rest.emailOptOut }          : {}),
      ...(consentConfirmedStatus   ? { consentStatus: consentConfirmedStatus }         : {}),
      ...(consentConfirmedDate     ? { consentDate:   consentConfirmedDate }           : {}),
      ...(rest.addressStreet     ? { addressStreet:     rest.addressStreet }     : {}),
      ...(rest.addressRegion     ? { addressRegion:     rest.addressRegion }     : {}),
      ...(rest.addressProvince   ? { addressProvince:   rest.addressProvince }   : {}),
      ...(rest.addressCity       ? { addressCity:       rest.addressCity }       : {}),
      ...(rest.addressBarangay   ? { addressBarangay:   rest.addressBarangay }   : {}),
      ...(rest.addressPostalCode ? { addressPostalCode: rest.addressPostalCode } : {}),
    }

    updateContact(payload, {
      onSuccess: () => {
        toast('Contact updated', { variant: 'success' })
        onSuccess()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSection title="Basic Info">
        <FormRow label="First Name" error={errors.firstName?.message}>
          <Input {...register('firstName')} autoFocus />
        </FormRow>
        <FormRow label="Last Name" error={errors.lastName?.message}>
          <Input {...register('lastName')} />
        </FormRow>
        <FormRow label="Title / Position" error={errors.title?.message}>
          <Input {...register('title')} />
        </FormRow>
        <FormRow label="Contact Type" error={errors.contactType?.message}>
          <Controller
            name="contactType"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
          <Input {...register('specialty')} />
        </FormRow>
        <FormRow label="Status" error={errors.status?.message}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {contactStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormRow>
      </FormSection>

      <FormSection title="Segmentation">
        <FormRow label="Customer Class" error={errors.customerClass?.message}>
          <Controller
            name="customerClass"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
        <FormRow label="Lead Source" error={errors.leadSource?.message}>
          <Controller
            name="leadSource"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
        <FormRow label="Professional Society" error={errors.professionalSociety?.message}>
          <Input {...register('professionalSociety')} placeholder="e.g. PMA, PPS" />
        </FormRow>
      </FormSection>

      <FormSection title="Consent & Compliance">
        <FormRow label="Consent Status" error={errors.consentConfirmedStatus?.message}>
          <Controller
            name="consentConfirmedStatus"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
          <DateInput {...register('consentConfirmedDate')} />
        </FormRow>
      </FormSection>

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
          <Input {...register('preferredContactTime')} placeholder="e.g. mornings" />
        </FormRow>
      </FormSection>

      <FormSection title="Licensing & Credentials">
        <FormRow label="PRC Number" error={errors.prcNumber?.message}>
          <Input {...register('prcNumber')} />
        </FormRow>
        <FormRow label="PRC Expiry Date" error={errors.prcExpiryDate?.message}>
          <DateInput {...register('prcExpiryDate')} />
        </FormRow>
        <FormRow label="NPI Number" error={errors.npiNumber?.message}>
          <Input {...register('npiNumber')} />
        </FormRow>
        <FormRow label="DEA Number" error={errors.deaNumber?.message}>
          <Input {...register('deaNumber')} />
        </FormRow>
        <FormRow label="State License Number" error={errors.stateLicenseNumber?.message}>
          <Input {...register('stateLicenseNumber')} />
        </FormRow>
        <FormRow label="Years of Experience" error={errors.yearsOfExperience?.message}>
          <Input {...register('yearsOfExperience')} type="number" min={0} />
        </FormRow>
        <FormRow label="Monthly Patient Volume" error={errors.patientVolumeMonthly?.message}>
          <Input {...register('patientVolumeMonthly')} type="number" min={0} />
        </FormRow>
        <CheckboxField label="Prescribing Authority" id="prescribingAuthority" {...register('prescribingAuthority')} />
        <CheckboxField label="Do Not Call" id="doNotCall" {...register('doNotCall')} />
        <CheckboxField label="Email Opt-Out" id="emailOptOut" {...register('emailOptOut')} />
      </FormSection>

      <FormSection title="Address">
        <FormRow label="Street" error={errors.addressStreet?.message}>
          <Input {...register('addressStreet')} />
        </FormRow>
          {/* Why: PhAddressFields is schema-agnostic (dynamic field names via prefix); Control<any> is the documented RHF pattern for reusable sub-field components */}
          <PhAddressFields control={control as never} setValue={setValue as never} errors={errors} />
        <FormRow label="Postal Code" error={errors.addressPostalCode?.message}>
          <Input {...register('addressPostalCode')} />
        </FormRow>
      </FormSection>

      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
        <Label className="text-sm font-semibold text-foreground">Notes</Label>
        <TextareaWithCounter {...register('notes')} rows={3} maxLength={2000} />
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
