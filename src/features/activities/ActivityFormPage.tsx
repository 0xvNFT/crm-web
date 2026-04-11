import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateActivity, useUpdateActivity, useActivity } from '@/api/endpoints/activities'
import { useStaffSearch } from '@/api/endpoints/users'
import { useConfig } from '@/api/endpoints/config'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/hooks/useAuth'
import { activitySchema, type ActivityFormData } from '@/schemas/activities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Textarea } from '@/components/ui/textarea'
import { CheckboxField } from '@/components/shared/CheckboxField'
import { FormRow } from '@/components/shared/FormRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormSection } from '@/components/shared/FormSection'
import { FormPageSkeleton } from '@/components/shared/FormPageSkeleton'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PharmaActivity, CreateActivityRequest, UpdateActivityRequest } from '@/api/app-types'

// Rendered only after data + config are ready — defaultValues are stable on first useForm call
function ActivityForm({ activity, isEdit }: { activity?: PharmaActivity; isEdit: boolean }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { mutate: createActivity, isPending: isCreating } = useCreateActivity()
  const { mutate: updateActivity, isPending: isUpdating } = useUpdateActivity(id ?? '')
  const isPending = isCreating || isUpdating

  const [ownerQuery, setOwnerQuery] = useState('')
  const debouncedOwnerQuery = useDebounce(ownerQuery, 300)
  const { data: ownerResults, isLoading: isSearchingOwners } = useStaffSearch(debouncedOwnerQuery)

  const activityTypeOptions = useConfigOptions('activity.type')
  const statusOptions       = useConfigOptions('activity.status')
  const priorityOptions     = useConfigOptions('activity.priority')

  const ownerOptions: ComboboxOption[] = (ownerResults ?? []).map((u) => ({
    value: u.id!,
    label: u.fullName ?? u.email ?? '',
  }))

  // Combobox needs a label fallback since options are only fetched on search
  const selectedOwnerOption: ComboboxOption | undefined = isEdit
    ? (activity?.assignedUserId
        ? { value: activity.assignedUserId, label: activity.assignedUserName ?? '' }
        : undefined)
    : (user?.userId
        ? { value: user.userId, label: user.fullName ?? user.email ?? '' }
        : undefined)

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ActivityFormData>({
    // Why: RHF v7 infers Resolver<FieldValues> from zodResolver; cast narrows to the concrete form type
    resolver: zodResolver(activitySchema) as Resolver<ActivityFormData>,
    defaultValues: isEdit && activity ? {
      subject:          activity.subject ?? '',
      activityType:     activity.activityType ?? undefined,
      assignedUserId:   activity.assignedUserId ?? undefined,
      status:           activity.status ?? undefined,
      priority:         activity.priority ?? undefined,
      dueDate:          activity.dueDate ?? '',
      durationMinutes:  activity.durationMinutes != null ? Number(activity.durationMinutes) : undefined,
      outcome:          activity.outcome ?? '',
      followUpRequired: activity.followUpRequired ?? false,
      followUpDate:     activity.followUpDate ?? '',
      followUpNotes:    activity.followUpNotes ?? '',
      description:      activity.description ?? '',
    } : {
      assignedUserId: user?.userId ?? '',
    },
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const followUpRequired = watch('followUpRequired')

  function onSubmit(data: ActivityFormData) {
    if (isEdit) {
      // Strip empty strings — backend rejects "" for optional fields
      // Why: Object.fromEntries loses static type info; shape is guaranteed by Zod activitySchema
      const payload: UpdateActivityRequest = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      ) as UpdateActivityRequest
      updateActivity(payload, {
        onSuccess: () => {
          toast('Activity updated', { variant: 'success' })
          navigate(`/activities/${id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    } else {
      // Why: Object.fromEntries not needed for create — data matches schema shape directly
      createActivity(data as CreateActivityRequest, {
        onSuccess: (created) => {
          toast('Activity created', { variant: 'success' })
          navigate(`/activities/${created.id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={isEdit ? 'Edit Activity' : 'New Activity'}
          description={isEdit ? 'Update activity details' : 'Log a new activity'}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Activity Info">
          <FormRow label="Subject" required error={errors.subject?.message}>
            <Input {...register('subject')} placeholder="e.g. Follow-up call with Dr. Santos" />
          </FormRow>
          <FormRow label="Type" required error={errors.activityType?.message}>
            <Controller
              name="activityType"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {activityTypeOptions.map((opt) => (
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
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Priority" error={errors.priority?.message}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Due Date" error={errors.dueDate?.message}>
            <DateInput {...register('dueDate')} />
          </FormRow>
          <FormRow label="Duration (minutes)" error={errors.durationMinutes?.message}>
            <Input {...register('durationMinutes')} type="number" min={0} placeholder="30" />
          </FormRow>
          <FormRow label="Outcome" error={errors.outcome?.message} className="sm:col-span-2">
            <Input {...register('outcome')} placeholder="e.g. Scheduled follow-up, Left voicemail" />
          </FormRow>
          <FormRow label="Assigned To" required error={errors.assignedUserId?.message}>
            <Controller
              name="assignedUserId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? undefined}
                  onChange={field.onChange}
                  options={ownerOptions}
                  selectedOption={selectedOwnerOption}
                  placeholder="Search staff…"
                  onSearchChange={setOwnerQuery}
                  isLoading={isSearchingOwners}
                  error={!!errors.assignedUserId}
                />
              )}
            />
          </FormRow>
        </FormSection>

        <div className="rounded-xl border bg-background p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Follow-up</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CheckboxField label="Follow-up Required" id="followUpRequired" className="sm:col-span-2" {...register('followUpRequired')} />
            {followUpRequired && (
              <>
                <FormRow label="Follow-up Date" error={errors.followUpDate?.message}>
                  <DateInput {...register('followUpDate')} />
                </FormRow>
                <FormRow label="Follow-up Notes" error={errors.followUpNotes?.message} className="sm:col-span-2">
                  <Textarea {...register('followUpNotes')} rows={2} placeholder="Notes for the follow-up…" />
                </FormRow>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-background p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Description</h2>
          <Textarea {...register('description')} rows={4} placeholder="Details about this activity…" />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Activity')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function ActivityFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { data: activity, isLoading: isLoadingActivity } = useActivity(id ?? '')
  const { isLoading: isLoadingConfig } = useConfig()

  if (isLoadingConfig || (isEdit && isLoadingActivity)) return <FormPageSkeleton />

  return <ActivityForm activity={activity} isEdit={isEdit} />
}
