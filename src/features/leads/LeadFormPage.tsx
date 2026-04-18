import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateLead, useUpdateLead, useLead } from '@/api/endpoints/leads'
import { useConfig } from '@/api/endpoints/config'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { leadSchema, type LeadFormData } from '@/schemas/leads'
import type { CreateLeadRequest, UpdateLeadRequest, PharmaLead } from '@/api/app-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormRow } from '@/components/shared/FormRow'
import { FormSection } from '@/components/shared/FormSection'
import { FormPageSkeleton } from '@/components/shared/FormPageSkeleton'
import { toast } from '@/hooks/useToast'
import { applyServerErrors } from '@/utils/errors'

interface LeadPrefill {
  accountId?: string
  contactId?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  companyName?: string
}

// Rendered only after data + config are ready — defaultValues are stable on first useForm call
function LeadForm({ lead, isEdit, prefill }: { lead?: PharmaLead; isEdit: boolean; prefill?: LeadPrefill }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { mutate: createLead, isPending: isCreating } = useCreateLead()
  const { mutate: updateLead, isPending: isUpdating } = useUpdateLead(id ?? '')
  const isPending = isCreating || isUpdating

  const leadStatusOptions = useConfigOptions('lead.status')
  const ratingOptions     = useConfigOptions('lead.rating')
  const leadSourceOptions = useConfigOptions('lead.source')

  const { register, handleSubmit, control, setError, formState: { errors } } = useForm<LeadFormData>({
    // Why: RHF v7 infers Resolver<FieldValues> from zodResolver; cast narrows to the concrete form type
    resolver: zodResolver(leadSchema) as Resolver<LeadFormData>,
    defaultValues: isEdit && lead ? {
      lastName:    lead.lastName    ?? '',
      firstName:   lead.firstName   ?? '',
      companyName: lead.companyName ?? '',
      email:       lead.email       ?? '',
      phone:       lead.phone       ?? '',
      leadStatus:  lead.leadStatus  ?? undefined,
      rating:      lead.rating      ?? undefined,
      leadSource:  lead.leadSource  ?? undefined,
      leadScore:   lead.leadScore != null ? Number(lead.leadScore) : undefined,
    } : {
      firstName:   prefill?.firstName   ?? '',
      lastName:    prefill?.lastName    ?? '',
      email:       prefill?.email       ?? '',
      phone:       prefill?.phone       ?? '',
      companyName: prefill?.companyName ?? '',
    },
  })

  function onSubmit(data: LeadFormData) {
    if (isEdit) {
      // Why: Object.fromEntries loses static type info; shape is guaranteed by Zod leadSchema
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      ) as unknown as UpdateLeadRequest
      updateLead(payload, {
        onSuccess: () => {
          toast('Lead updated', { variant: 'success' })
          navigate(`/leads/${id}`)
        },
        onError: (err) => applyServerErrors(err, setError, (msg) => toast(msg, { variant: 'destructive' })),
      })
    } else {
      // Why: Object.fromEntries loses static type info; shape is guaranteed by Zod leadSchema
      const payload = {
        ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)),
        ...(prefill?.accountId ? { accountId: prefill.accountId } : {}),
        ...(prefill?.contactId ? { contactId: prefill.contactId } : {}),
      } as unknown as CreateLeadRequest
      createLead(payload, {
        onSuccess: (created) => {
          toast('Lead created', { variant: 'success' })
          navigate(`/leads/${created.id}`)
        },
        onError: (err) => applyServerErrors(err, setError, (msg) => toast(msg, { variant: 'destructive' })),
      })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <PageHeader
          title={isEdit ? 'Edit Lead' : 'New Lead'}
          description={isEdit ? 'Update lead details' : 'Create a new lead'}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Contact Info">
          <FormRow label="First Name" error={errors.firstName?.message}>
            {prefill?.firstName
              ? <p className="text-sm text-foreground py-2">{prefill.firstName}</p>
              : <Input {...register('firstName')} placeholder="Juan" />}
          </FormRow>
          <FormRow label="Last Name" required error={errors.lastName?.message}>
            {prefill?.lastName
              ? <p className="text-sm text-foreground py-2">{prefill.lastName}</p>
              : <Input {...register('lastName')} placeholder="Dela Cruz" />}
          </FormRow>
          <FormRow label="Company" error={errors.companyName?.message}>
            {prefill?.companyName
              ? <p className="text-sm text-foreground py-2">{prefill.companyName}</p>
              : <Input {...register('companyName')} placeholder="Company name" />}
          </FormRow>
          <FormRow label="Email" error={errors.email?.message}>
            {prefill?.email
              ? <p className="text-sm text-foreground py-2">{prefill.email}</p>
              : <Input {...register('email')} type="email" placeholder="juan@example.com" />}
          </FormRow>
          <FormRow label="Phone" error={errors.phone?.message}>
            {prefill?.phone
              ? <p className="text-sm text-foreground py-2">{prefill.phone}</p>
              : <Input {...register('phone')} placeholder="+63 9xx xxx xxxx" />}
          </FormRow>
        </FormSection>

        <FormSection title="Lead Details">
          <FormRow label="Status" error={errors.leadStatus?.message}>
            <Controller
              name="leadStatus"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {leadStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Rating" error={errors.rating?.message}>
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                  <SelectContent>
                    {ratingOptions.map((opt) => (
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
          <FormRow label="Lead Score" error={errors.leadScore?.message}>
            <Input {...register('leadScore')} type="number" min={0} placeholder="0" />
          </FormRow>
        </FormSection>

        <div className="sticky bottom-0 -mx-6 border-t border-border/50 bg-background/95 backdrop-blur-sm px-6 py-3 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Lead')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function LeadFormPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const isEdit = !!id
  const prefill = !isEdit ? (location.state as LeadPrefill | null) ?? undefined : undefined
  const { data: lead, isLoading: isLoadingLead } = useLead(id ?? '')
  const { isLoading: isLoadingConfig } = useConfig()

  if (isLoadingConfig || (isEdit && isLoadingLead)) return <FormPageSkeleton />

  return <LeadForm lead={lead} isEdit={isEdit} prefill={prefill} />
}
