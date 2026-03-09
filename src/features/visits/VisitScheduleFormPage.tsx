import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useScheduleVisit } from '@/api/endpoints/visits'
import { useAccounts } from '@/api/endpoints/accounts'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { scheduleVisitSchema, type ScheduleVisitFormData } from '@/schemas/visits'

const VISIT_TYPES = [
  { value: 'detailing', label: 'Detailing' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'sample_drop', label: 'Sample Drop' },
  { value: 'educational', label: 'Educational' },
  { value: 'relationship', label: 'Relationship Building' },
  { value: 'other', label: 'Other' },
]

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

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

export default function VisitScheduleFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mutate: scheduleVisit, isPending } = useScheduleVisit()
  const { data: accountsPage } = useAccounts(0, 100)
  const accounts = accountsPage?.content ?? []

  const { register, handleSubmit, control, formState: { errors } } = useForm<ScheduleVisitFormData>({
    resolver: zodResolver(scheduleVisitSchema),
  })

  function onSubmit(data: ScheduleVisitFormData) {
    if (!user?.userId) return
    const { accountId, contactId, territoryId, ...visitFields } = data
    scheduleVisit(
      {
        visit: {
          subject: visitFields.subject,
          visitType: visitFields.visitType,
          scheduledStart: visitFields.scheduledStart,
          scheduledEnd: visitFields.scheduledEnd,
          callObjectives: visitFields.callObjectives,
          notes: visitFields.notes,
        },
        repId: user.userId,
        accountId,
        contactId: contactId || undefined,
        territoryId: territoryId || undefined,
      },
      {
        onSuccess: (visit) => {
          toast('Visit scheduled', { variant: 'success' })
          navigate(`/visits/${visit.id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/visits')} className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="Schedule Visit" description="Plan a new field visit" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Visit Information">
          <div className="sm:col-span-2">
            <FormRow label="Subject" required error={errors.subject?.message}>
              <Input {...register('subject')} placeholder="e.g. Q1 Product Detailing — Dr. Santos" autoFocus />
            </FormRow>
          </div>

          <FormRow label="Account" required error={errors.accountId?.message}>
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account…" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id ?? ''}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>

          <FormRow label="Visit Type" required error={errors.visitType?.message}>
            <Controller
              name="visitType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Schedule">
          <FormRow label="Scheduled Start" required error={errors.scheduledStart?.message}>
            <Input {...register('scheduledStart')} type="datetime-local" />
          </FormRow>
          <FormRow label="Scheduled End" required error={errors.scheduledEnd?.message}>
            <Input {...register('scheduledEnd')} type="datetime-local" />
          </FormRow>
        </FormSection>

        <div className="rounded-xl border bg-background p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Call Details</h2>
          <div className="space-y-4">
            <FormRow label="Call Objectives" error={errors.callObjectives?.message}>
              <Textarea
                {...register('callObjectives')}
                placeholder="What do you aim to achieve in this visit?"
                rows={3}
              />
            </FormRow>
            <FormRow label="Notes" error={errors.notes?.message}>
              <Textarea
                {...register('notes')}
                placeholder="Any additional notes…"
                rows={2}
              />
            </FormRow>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 -mx-6 border-t bg-background px-6 py-3 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/visits')} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Scheduling…' : 'Schedule Visit'}
          </Button>
        </div>
      </form>
    </div>
  )
}
