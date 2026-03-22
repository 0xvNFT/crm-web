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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PharmaActivity } from '@/api/app-types'

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
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

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
    ? (activity?.assignedUser
        ? { value: activity.assignedUser.id!, label: activity.assignedUser.fullName ?? activity.assignedUser.email ?? '' }
        : undefined)
    : (user?.userId
        ? { value: user.userId, label: user.fullName ?? user.email ?? '' }
        : undefined)

  const { register, handleSubmit, control, formState: { errors } } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema) as Resolver<ActivityFormData>,
    defaultValues: isEdit && activity ? {
      subject:         activity.subject ?? '',
      activityType:    activity.activityType ?? '',
      assignedUserId:  activity.assignedUser?.id ?? '',
      status:          activity.status ?? '',
      priority:        activity.priority ?? '',
      dueDate:         activity.dueDate ?? '',
      durationMinutes: activity.durationMinutes != null ? Number(activity.durationMinutes) : undefined,
      description:     activity.description ?? '',
    } : {
      assignedUserId: user?.userId ?? '',
    },
  })

  function onSubmit(data: ActivityFormData) {
    if (isEdit) {
      updateActivity(data, {
        onSuccess: () => {
          toast('Activity updated', { variant: 'success' })
          navigate(`/activities/${id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    } else {
      createActivity(data, {
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
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
            <Input {...register('dueDate')} type="date" />
          </FormRow>
          <FormRow label="Duration (minutes)" error={errors.durationMinutes?.message}>
            <Input {...register('durationMinutes')} type="number" min={0} placeholder="30" />
          </FormRow>
          <FormRow label="Assigned To" required error={errors.assignedUserId?.message}>
            <Controller
              name="assignedUserId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
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

  if (isLoadingConfig || (isEdit && isLoadingActivity)) return <LoadingSpinner />

  return <ActivityForm activity={activity} isEdit={isEdit} />
}
