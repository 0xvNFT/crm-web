import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCoachingNote, useCreateCoachingNote, useUpdateCoachingNote } from '@/api/endpoints/coaching'
import { useStaffSearch } from '@/api/endpoints/users'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter'
import { CheckboxField } from '@/components/shared/CheckboxField'
import { FormRow } from '@/components/shared/FormRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormPageSkeleton } from '@/components/shared/FormPageSkeleton'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { coachingNoteSchema, coachingNoteEditSchema, type CoachingNoteFormData, type CoachingNoteEditFormData } from '@/schemas/coaching'
import type { PharmaCoachingNote } from '@/api/app-types'
import { useState } from 'react'
import { FormSection } from '@/components/shared/FormSection'

// ─── Staff combobox with search ───────────────────────────────────────────────
function StaffCombobox({
  value,
  onChange,
  selectedLabel,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  selectedLabel?: string
  placeholder: string
}) {
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 300)
  const { data: results } = useStaffSearch(debouncedQ)

  const options = (results ?? []).map((u) => ({
    value: u.id ?? '',
    label: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    sublabel: u.email,
  }))

  return (
    <Combobox
      value={value}
      onChange={onChange}
      options={options}
      onSearchChange={setQ}
      placeholder={placeholder}
      selectedOption={value && selectedLabel ? { value, label: selectedLabel } : undefined}
    />
  )
}

// ─── Inner form (rendered after data is ready) ────────────────────────────────
function CoachingForm({ note, isEdit }: { note?: PharmaCoachingNote; isEdit: boolean }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { mutate: createNote, isPending: isCreating } = useCreateCoachingNote()
  const { mutate: updateNote, isPending: isUpdating } = useUpdateCoachingNote(id ?? '')
  const isPending = isCreating || isUpdating

  const feedbackTypeOptions = useConfigOptions('coaching.feedbackType')
  const reviewedModuleOptions = useConfigOptions('coaching.reviewedModule')

  const schema = isEdit ? coachingNoteEditSchema : coachingNoteSchema

  const { register, control, handleSubmit, watch, formState: { errors } } =
    useForm<CoachingNoteFormData | CoachingNoteEditFormData>({
      // Why: RHF v7 infers Resolver<FieldValues> from zodResolver; cast narrows to the concrete form type
      resolver: zodResolver(schema) as Resolver<CoachingNoteFormData | CoachingNoteEditFormData>,
      defaultValues: isEdit && note ? {
        noteTitle:         note.noteTitle ?? '',
        feedbackType:      note.feedbackType ?? undefined,
        detailedFeedback:  note.detailedFeedback ?? '',
        summaryOfFeedback: note.summaryOfFeedback ?? '',
        reviewedModule:    note.reviewedModule ?? undefined,
        moduleProgressPct: note.moduleProgressPct ?? undefined,
        followUpRequired:  note.followUpRequired ?? false,
        followUpDate:      note.followUpDate ?? '',
      } : {
        coachId:          user?.userId ?? '',
        repId:            '',
        followUpRequired: false,
      },
    })

  // eslint-disable-next-line react-hooks/incompatible-library
  const followUpRequired = watch('followUpRequired')

  function onSubmit(data: CoachingNoteFormData | CoachingNoteEditFormData) {
    // Strip empty strings from optional uuid/string fields before sending to API
    const cleaned = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '')
    ) as typeof data

    if (isEdit) {
      updateNote(cleaned as CoachingNoteEditFormData, {
        onSuccess: () => {
          toast('Coaching note updated', { variant: 'success' })
          navigate(`/coaching/${id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    } else {
      createNote(cleaned as CoachingNoteFormData, {
        onSuccess: (created) => {
          toast('Coaching note created', { variant: 'success' })
          navigate(`/coaching/${created.id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={isEdit ? 'Edit Coaching Note' : 'New Coaching Note'}
          description={isEdit ? 'Update coaching session details' : 'Record a field rep coaching session'}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <FormSection title="Session Info">
          <FormRow label="Title" required error={errors.noteTitle?.message}>
            <Input {...register('noteTitle')} placeholder="e.g. Q1 Product Knowledge Review" autoFocus />
          </FormRow>
          <FormRow label="Feedback Type" required={!isEdit} error={(errors as Record<string, { message?: string }>).feedbackType?.message}>
            <Controller
              name="feedbackType"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                  <SelectContent>
                    {feedbackTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Date Provided" error={(errors as Record<string, { message?: string }>).dateProvided?.message}>
            <DateInput {...register('dateProvided')} />
          </FormRow>

          {!isEdit && (
            <>
              <FormRow label="Rep (Coached)" required error={(errors as Record<string, { message?: string }>).repId?.message}>
                <Controller
                  name="repId"
                  control={control}
                  render={({ field }) => (
                    <StaffCombobox
                      value={field.value as string}
                      onChange={field.onChange}
                      placeholder="Search rep by name…"
                    />
                  )}
                />
              </FormRow>
              <FormRow label="Coach" required error={(errors as Record<string, { message?: string }>).coachId?.message}>
                <Controller
                  name="coachId"
                  control={control}
                  render={({ field }) => (
                    <StaffCombobox
                      value={field.value as string}
                      onChange={field.onChange}
                      selectedLabel={user?.fullName}
                      placeholder="Search coach by name…"
                    />
                  )}
                />
              </FormRow>
            </>
          )}
        </FormSection>

        <FormSection title="Module Review">
          <FormRow label="Reviewed Module" error={(errors as Record<string, { message?: string }>).reviewedModule?.message}>
            <Controller
              name="reviewedModule"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select module…" /></SelectTrigger>
                  <SelectContent>
                    {reviewedModuleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Module Progress (%)" error={(errors as Record<string, { message?: string }>).moduleProgressPct?.message}>
            <Input {...register('moduleProgressPct')} type="number" min={0} max={100} placeholder="0–100" />
          </FormRow>
        </FormSection>

        <FormSection title="Feedback">
          <div className="sm:col-span-2">
            <FormRow label="Detailed Feedback" required={!isEdit} error={(errors as Record<string, { message?: string }>).detailedFeedback?.message}>
              <TextareaWithCounter {...register('detailedFeedback')} rows={4} maxLength={2000} placeholder="Detailed observations and feedback…" />
            </FormRow>
          </div>
          <div className="sm:col-span-2">
            <FormRow label="Summary" error={errors.summaryOfFeedback?.message}>
              <TextareaWithCounter {...register('summaryOfFeedback')} rows={2} maxLength={2000} placeholder="Brief summary…" />
            </FormRow>
          </div>
        </FormSection>

        <FormSection title="Follow-up">
          <CheckboxField label="Follow-up Required" id="followUpRequired" {...register('followUpRequired')} />
          {followUpRequired && (
            <FormRow label="Follow-up Date" error={(errors as Record<string, { message?: string }>).followUpDate?.message}>
              <DateInput {...register('followUpDate')} />
            </FormRow>
          )}
        </FormSection>

        {/* Sticky footer */}
        <div className="sticky bottom-0 -mx-6 border-t border-border/50 bg-background/95 backdrop-blur-sm px-6 py-3 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Note')}
          </Button>
        </div>
      </form>
    </div>
  )
}

// ─── Page (outer — gates on data load) ───────────────────────────────────────
export default function CoachingFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { data: note, isLoading } = useCoachingNote(id ?? '')

  if (isEdit && isLoading) return <FormPageSkeleton />

  return <CoachingForm note={note} isEdit={isEdit} />
}
