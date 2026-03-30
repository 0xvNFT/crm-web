import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, X } from 'lucide-react'
import { useUpdateVisit } from '@/api/endpoints/visits'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormRow } from '@/components/shared/FormRow'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { visitEditSchema, type VisitEditFormData } from '@/schemas/visits'
import type { PharmaFieldVisit } from '@/api/app-types'

interface VisitEditFormProps {
  visitId: string
  visit: PharmaFieldVisit
  onSuccess: () => void
  onCancel: () => void
}

// Sentiment is a fixed 3-value enum — not in config endpoint
const SENTIMENT_OPTIONS = [
  { value: 'positive', label: 'Positive' },
  { value: 'neutral',  label: 'Neutral' },
  { value: 'negative', label: 'Negative' },
]

export function VisitEditForm({ visitId, visit, onSuccess, onCancel }: VisitEditFormProps) {
  const { mutate: updateVisit, isPending } = useUpdateVisit(visitId)
  const visitTypeOptions = useConfigOptions('visit.type')
  const visitPriorityOptions = useConfigOptions('visit.priority')

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<VisitEditFormData>({
    resolver: zodResolver(visitEditSchema),
  })

  useEffect(() => {
    reset({
      subject:        visit.subject        ?? '',
      locationName:   visit.locationName   ?? '',
      visitType:      visit.visitType      ?? '',
      priority:       visit.priority       ?? '',
      sentiment:      visit.sentiment      ?? '',
      scheduledStart: visit.scheduledStart ?? '',
      scheduledEnd:   visit.scheduledEnd   ?? '',
      callObjectives: visit.callObjectives ?? '',
      notes:          visit.notes          ?? '',
    })
  }, [visit, reset])

  function onSubmit(data: VisitEditFormData) {
    updateVisit(data, {
      onSuccess: () => {
        toast('Visit updated', { variant: 'success' })
        onSuccess()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-xl border bg-background p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Edit Visit</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormRow label="Subject" required error={errors.subject?.message} className="sm:col-span-2">
            <Input {...register('subject')} autoFocus />
          </FormRow>
          <FormRow label="Visit Type" required error={errors.visitType?.message}>
            <Controller
              name="visitType"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {visitTypeOptions.map((opt) => (
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
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                  <SelectContent>
                    {visitPriorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Sentiment" error={errors.sentiment?.message}>
            <Controller
              name="sentiment"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select sentiment" /></SelectTrigger>
                  <SelectContent>
                    {SENTIMENT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Location Name" error={errors.locationName?.message}>
            <Input {...register('locationName')} placeholder="e.g. Main Clinic" />
          </FormRow>
          <FormRow label="Scheduled Start" required error={errors.scheduledStart?.message}>
            <Input {...register('scheduledStart')} type="datetime-local" />
          </FormRow>
          <FormRow label="Scheduled End" error={errors.scheduledEnd?.message}>
            <Input {...register('scheduledEnd')} type="datetime-local" />
          </FormRow>
          <FormRow label="Call Objectives" error={errors.callObjectives?.message} className="sm:col-span-2">
            <Textarea {...register('callObjectives')} rows={2} />
          </FormRow>
          <FormRow label="Notes" error={errors.notes?.message} className="sm:col-span-2">
            <Textarea {...register('notes')} rows={2} />
          </FormRow>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          <X className="h-3.5 w-3.5 mr-1.5" />
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          <Check className="h-3.5 w-3.5 mr-1.5" />
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
