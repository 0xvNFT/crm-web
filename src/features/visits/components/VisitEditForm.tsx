import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, X } from 'lucide-react'
import { useUpdateVisit } from '@/api/endpoints/visits'
import { useOpportunitySearch } from '@/api/endpoints/opportunities'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormRow } from '@/components/shared/FormRow'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { visitEditSchema, type VisitEditFormData } from '@/schemas/visits'
import type { PharmaFieldVisit, UpdateVisitRequest } from '@/api/app-types'

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

  const [oppQuery, setOppQuery] = useState('')
  const debouncedOppQuery = useDebounce(oppQuery, 300)
  const { data: oppResults, isLoading: isSearchingOpps } = useOpportunitySearch(debouncedOppQuery)
  const oppOptions: ComboboxOption[] = (oppResults ?? []).map((o) => ({ value: o.id!, label: o.topic ?? o.id! }))
  const selectedOppOption: ComboboxOption | undefined = visit.opportunityId
    ? { value: visit.opportunityId, label: visit.opportunityName ?? visit.opportunityId }
    : undefined

  const { register, handleSubmit, control, formState: { errors } } = useForm<VisitEditFormData>({
    resolver: zodResolver(visitEditSchema),
    defaultValues: {
      subject:        visit.subject        ?? '',
      locationName:   visit.locationName   ?? '',
      visitType:      visit.visitType      ?? undefined,
      priority:       visit.priority       ?? undefined,
      sentiment:      visit.sentiment      ?? undefined,
      scheduledStart: visit.scheduledStart ?? '',
      scheduledEnd:   visit.scheduledEnd   ?? '',
      callObjectives: visit.callObjectives ?? '',
      notes:          visit.notes          ?? '',
      opportunityId:  visit.opportunityId  ?? undefined,
    },
  })

  function onSubmit(data: VisitEditFormData) {
    // Why: Object.fromEntries loses static type info; shape is guaranteed by Zod visitEditSchema
    const base = Object.fromEntries(
      Object.entries(data).filter(([k, v]) => v !== '' && v !== undefined && k !== 'clearOpportunity')
    ) as UpdateVisitRequest
    // If there was an opportunity linked and the user cleared the field, send clearOpportunity: true
    const hadOpportunity = !!visit.opportunityId
    const clearedOpportunity = hadOpportunity && !data.opportunityId
    const clean: UpdateVisitRequest = clearedOpportunity
      ? { ...base, clearOpportunity: true }
      : base
    updateVisit(clean, {
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
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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
          <FormRow label="Opportunity" error={errors.opportunityId?.message} className="sm:col-span-2">
            <Controller
              name="opportunityId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={oppOptions}
                  selectedOption={selectedOppOption}
                  placeholder="Link an opportunity…"
                  searchPlaceholder="Search opportunities…"
                  onSearchChange={setOppQuery}
                  isLoading={isSearchingOpps}
                  error={!!errors.opportunityId}
                />
              )}
            />
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
