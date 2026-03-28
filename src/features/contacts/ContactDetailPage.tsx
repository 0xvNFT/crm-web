// REFERENCE PATTERN — Interns: copy the view mode structure only (DetailSection, DetailField, header, quick-contact strip).
// Ignore everything related to editing (useForm, useUpdateContact, editing state, FormSection, FormRow, edit form JSX).
// Your task is read-only — list + detail view. No create or edit required.
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Award, Shield, Pencil, X, Check, Trash2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContact, useUpdateContact, useDeleteContact } from '@/api/endpoints/contacts'
import type { UpdateContactRequest } from '@/api/app-types'
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
import { Textarea } from '@/components/ui/textarea'
import { FormRow } from '@/components/shared/FormRow'
import { formatDate, formatLabel } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { contactEditSchema, type ContactEditFormData } from '@/schemas/contacts'

import { ContactVisitsSection } from './components/ContactVisitsSection'
import { ContactActivitiesSection } from './components/ContactActivitiesSection'
import { ContactOpportunitiesSection } from './components/ContactOpportunitiesSection'
import { ContactAffiliationsSection } from './components/ContactAffiliationsSection'

// ─── Sub-components ────────────────────────────────────────────────────────────
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
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

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const { data: contact, isLoading, isError } = useContact(id ?? '')
  const { mutate: updateContact, isPending } = useUpdateContact(id ?? '')
  const { mutate: deleteContact, isPending: isDeleting } = useDeleteContact()
  const { isManager } = useRole()
  const contactTypeOptions = useConfigOptions('contact.type')
  const contactStatusOptions = useConfigOptions('contact.status')
  const consentStatusOptions = useConfigOptions('contact.consentStatus')

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ContactEditFormData>({
    resolver: zodResolver(contactEditSchema),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError || !contact) return <ErrorMessage message="Contact not found." />

  const fullName = [contact.salutation, contact.firstName, contact.middleName, contact.lastName]
    .filter(Boolean)
    .join(' ')

  const fullAddress = [
    contact.addressStreet,
    contact.addressBarangay,
    contact.addressCity,
    contact.addressProvince,
    contact.addressPostalCode,
    contact.addressCountry,
  ]
    .filter(Boolean)
    .join(', ')

  function startEdit() {
    reset({
      firstName: contact?.firstName ?? '',
      lastName: contact?.lastName ?? '',
      title: contact?.title ?? '',
      email: contact?.email ?? '',
      phone: contact?.phone ?? '',
      mobile: contact?.mobile ?? '',
      contactType: contact?.contactType ?? undefined,
      specialty: contact?.specialty ?? '',
      npiNumber: contact?.npiNumber ?? '',
      deaNumber: contact?.deaNumber ?? '',
      stateLicenseNumber: contact?.stateLicenseNumber ?? '',
      prescribingAuthority: contact?.prescribingAuthority ?? false,
      yearsOfExperience: contact?.yearsOfExperience ?? undefined,
      patientVolumeMonthly: contact?.patientVolumeMonthly ?? undefined,
      preferredContactMethod: contact?.preferredContactMethod ?? '',
      preferredContactTime: contact?.preferredContactTime ?? '',
      status: contact?.status ?? 'active',
      consentConfirmedStatus: contact?.consentConfirmedStatus ?? undefined,
      consentConfirmedDate: contact?.consentConfirmedDate ?? '',
      notes: contact?.notes ?? '',
    })
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    reset()
  }

  function onSubmit(data: ContactEditFormData) {
    const { consentConfirmedStatus, consentConfirmedDate, ...rest } = data

    // Strip empty strings + map consent field names to request DTO names
    const payload = Object.fromEntries(
      Object.entries({
        ...rest,
        ...(consentConfirmedStatus ? { consentStatus: consentConfirmedStatus } : {}),
        ...(consentConfirmedDate ? { consentDate: consentConfirmedDate } : {}),
      }).filter(([, v]) => v !== '' && v !== undefined)
    ) as unknown as UpdateContactRequest
    updateContact(payload, {
      onSuccess: () => {
        toast('Contact updated', { variant: 'success' })
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{fullName}</h1>
            <StatusBadge status={(contact.status ?? 'active').toUpperCase()} />
            {contact.prescribingAuthority && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                <Award className="h-3 w-3" />
                Prescriber
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {contact.title && <span>{contact.title}</span>}
            {contact.contactType && (
              <>
                <span>·</span>
                <span>{formatLabel(contact.contactType)}</span>
              </>
            )}
            {contact.specialty && (
              <>
                <span>·</span>
                <span>{contact.specialty}</span>
              </>
            )}
            {contact.account?.name && (
              <>
                <span>·</span>
                <span>{contact.account.name}</span>
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
        {contact.mobile && (
          <a
            href={`tel:${contact.mobile}`}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            {contact.mobile}
          </a>
        )}
        {contact.phone && contact.phone !== contact.mobile && (
          <a
            href={`tel:${contact.phone}`}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Phone className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            {contact.phone}
          </a>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Mail className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
            {contact.email}
          </a>
        )}
        {fullAddress && (
          <span className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
            {fullAddress}
          </span>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={() =>
          deleteContact(id ?? '', {
            onSuccess: () => {
              toast('Contact deleted', { variant: 'success' })
              navigate('/contacts')
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Delete Contact?"
        description={`This will permanently delete "${fullName}" and all associated data. This cannot be undone.`}
        isPending={isDeleting}
      />

      {/* View mode */}
      {!editing && (
        <div className="space-y-4">
          <DetailSection title="Professional Info">
            <DetailField label="Contact Type" value={formatLabel(contact.contactType)} />
            <DetailField label="Specialty" value={contact.specialty} />
            <DetailField label="Customer Class" value={contact.customerClass} />
            <DetailField label="Adoption Stage" value={formatLabel(contact.adoptionStage)} />
            <DetailField label="Years of Experience" value={contact.yearsOfExperience} />
            <DetailField label="Monthly Patient Volume" value={contact.patientVolumeMonthly} />
            <DetailField label="Professional Society" value={contact.professionalSociety} />
            <DetailField label="Lead Source" value={formatLabel(contact.leadSource)} />
          </DetailSection>

          <DetailSection title="Licensing & Credentials">
            <DetailField label="PRC Number" value={contact.prcNumber} />
            <DetailField label="PRC Expiry" value={formatDate(contact.prcExpiryDate)} />
            <DetailField label="NPI Number" value={contact.npiNumber} />
            <DetailField label="DEA Number" value={contact.deaNumber} />
            <DetailField label="State License" value={contact.stateLicenseNumber} />
            <DetailField label="Prescribing Authority" value={contact.prescribingAuthority} />
          </DetailSection>

          <DetailSection title="Contact Preferences">
            <DetailField label="Preferred Contact Method" value={formatLabel(contact.preferredContactMethod)} />
            <DetailField label="Preferred Contact Time" value={contact.preferredContactTime} />
            <DetailField label="Do Not Call" value={contact.doNotCall} />
            <DetailField label="Email Opt-Out" value={contact.emailOptOut} />
          </DetailSection>

          <DetailSection title="Consent & Compliance">
            <DetailField label="Consent Status" value={formatLabel(contact.consentConfirmedStatus)} />
            <DetailField label="Consent Date" value={formatDate(contact.consentConfirmedDate)} />
          </DetailSection>

          {contact.notes && (
            <div className="rounded-xl border bg-background p-5 space-y-2">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                Notes
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
            </div>
          )}

          <div className="rounded-xl border bg-background p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DetailField label="Contact Code" value={contact.contactCode} />
              <DetailField label="Created" value={formatDate(contact.createdAt)} />
              <DetailField label="Last Updated" value={formatDate(contact.updatedAt)} />
            </div>
          </div>

          <ContactAffiliationsSection contactId={id ?? ''} />
          <ContactOpportunitiesSection contactId={id ?? ''} />
          <ContactVisitsSection contactId={id ?? ''} />
          <ContactActivitiesSection contactId={id ?? ''} />
        </div>
      )}

      {/* Edit mode */}
      {editing && (
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
                  <Select value={field.value} onValueChange={field.onChange}>
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
                  <Select value={field.value} onValueChange={field.onChange}>
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

          <FormSection title="Consent & Compliance">
            <FormRow label="Consent Status" error={errors.consentConfirmedStatus?.message}>
              <Controller
                name="consentConfirmedStatus"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
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

          <div className="rounded-xl border bg-background p-5 space-y-2">
            <Label className="text-sm font-semibold text-foreground">Notes</Label>
            <Textarea {...register('notes')} rows={3} />
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
