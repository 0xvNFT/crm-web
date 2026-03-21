import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateTeam, useUpdateTeam, useTeam } from '@/api/endpoints/teams'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { createTeamSchema, updateTeamSchema, type UpdateTeamFormData } from '@/schemas/teams'
import type { PharmaTeam } from '@/api/app-types'

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

// Rendered only after data is ready — defaultValues are stable on first useForm call
function TeamForm({ team, isEdit }: { team?: PharmaTeam; isEdit: boolean }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { mutate: createTeam, isPending: isCreating } = useCreateTeam()
  const { mutate: updateTeam, isPending: isUpdating } = useUpdateTeam(id ?? '')
  const isPending = isCreating || isUpdating
  const teamTypeOptions = useConfigOptions('team.type')

  const schema = isEdit ? updateTeamSchema : createTeamSchema

  const { register, control, handleSubmit, formState: { errors } } = useForm<UpdateTeamFormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit && team ? {
      name:         team.name ?? '',
      teamType:     team.teamType ?? '',
      description:  team.description ?? '',
      emailAddress: team.emailAddress ?? '',
    } : {},
  })

  function onSubmit(data: UpdateTeamFormData) {
    // Strip empty emailAddress — backend rejects empty string
    const payload = { ...data, emailAddress: data.emailAddress?.trim() || undefined }

    if (isEdit) {
      updateTeam(payload, {
        onSuccess: () => {
          toast('Team updated', { variant: 'success' })
          navigate(`/teams/${id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    } else {
      createTeam(payload, {
        onSuccess: (created) => {
          toast('Team created', { variant: 'success' })
          navigate(`/teams/${created.id}`)
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
          title={isEdit ? 'Edit Team' : 'New Team'}
          description={isEdit ? 'Update team details' : 'Create a new field force team'}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Team Info">
          <FormRow label="Team Name" required error={errors.name?.message}>
            <Input {...register('name')} placeholder="e.g. Metro Manila Sales Team" autoFocus />
          </FormRow>
          <FormRow label="Team Type" error={errors.teamType?.message}>
            <Controller
              name="teamType"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Email Address" error={errors.emailAddress?.message}>
            <Input {...register('emailAddress')} type="email" placeholder="team@example.com" />
          </FormRow>
          <div className="sm:col-span-2">
            <FormRow label="Description" error={errors.description?.message}>
              <Textarea {...register('description')} placeholder="Optional description" rows={3} />
            </FormRow>
          </div>
        </FormSection>

        {/* Sticky footer */}
        <div className="sticky bottom-0 -mx-6 border-t bg-background px-6 py-3 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Team')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function TeamFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { data: team, isLoading: isLoadingTeam } = useTeam(id ?? '')

  if (isEdit && isLoadingTeam) return <LoadingSpinner />

  return <TeamForm team={team} isEdit={isEdit} />
}
