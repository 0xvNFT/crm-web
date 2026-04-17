import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useScheduleVisit } from '@/api/endpoints/visits'
import { useAccountSearch } from '@/api/endpoints/accounts'
import { useOpportunitySearch } from '@/api/endpoints/opportunities'
import { useCampaignSearch } from '@/api/endpoints/campaigns'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateTimeInput } from '@/components/ui/date-time-input'
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter'
import { FormRow } from '@/components/shared/FormRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { scheduleVisitSchema, type ScheduleVisitFormData } from '@/schemas/visits'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { FormSection } from '@/components/shared/FormSection'

export default function VisitScheduleFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mutate: scheduleVisit, isPending } = useScheduleVisit()
  const visitTypeOptions = useConfigOptions('visit.type')

  const [accountQuery, setAccountQuery] = useState('')
  const debouncedAccountQuery = useDebounce(accountQuery, 300)
  const { data: accountResults, isLoading: isSearchingAccounts } = useAccountSearch(debouncedAccountQuery)
  const accountOptions: ComboboxOption[] = (accountResults ?? []).map((a) => ({ value: a.id!, label: a.name ?? '' }))

  const [oppQuery, setOppQuery] = useState('')
  const debouncedOppQuery = useDebounce(oppQuery, 300)
  const { data: oppResults, isLoading: isSearchingOpps } = useOpportunitySearch(debouncedOppQuery)
  const oppOptions: ComboboxOption[] = (oppResults ?? []).map((o) => ({ value: o.id!, label: o.topic ?? o.id! }))

  const [campaignQuery, setCampaignQuery] = useState('')
  const debouncedCampaignQuery = useDebounce(campaignQuery, 300)
  const { data: campaignResults, isLoading: isSearchingCampaigns } = useCampaignSearch(debouncedCampaignQuery)
  const campaignOptions: ComboboxOption[] = (campaignResults ?? []).map((c) => ({ value: c.id!, label: c.name ?? c.id! }))

  const { register, handleSubmit, control, formState: { errors } } = useForm<ScheduleVisitFormData>({
    resolver: zodResolver(scheduleVisitSchema),
  })

  function onSubmit(data: ScheduleVisitFormData) {
    if (!user?.userId) return
    scheduleVisit(
      {
        repId: user.userId,
        accountId: data.accountId,
        contactId: data.contactId || undefined,
        territoryId: data.territoryId || undefined,
        opportunityId: data.opportunityId || undefined,
        campaignId: data.campaignId || undefined,
        subject: data.subject,
        visitType: data.visitType,
        scheduledStart: data.scheduledStart,
        scheduledEnd: data.scheduledEnd || undefined,
        callObjectives: data.callObjectives || undefined,
        notes: data.notes || undefined,
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
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/visits')} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <PageHeader title="Schedule Visit" description="Plan a new field visit" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={accountOptions}
                  placeholder="Search accounts…"
                  onSearchChange={setAccountQuery}
                  isLoading={isSearchingAccounts}
                  error={!!errors.accountId}
                />
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
                    {visitTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>

          <FormRow label="Opportunity" error={errors.opportunityId?.message}>
            <Controller
              name="opportunityId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={oppOptions}
                  placeholder="Link an opportunity…"
                  searchPlaceholder="Search opportunities…"
                  onSearchChange={setOppQuery}
                  isLoading={isSearchingOpps}
                  error={!!errors.opportunityId}
                />
              )}
            />
          </FormRow>

          <FormRow label="Campaign" error={errors.campaignId?.message}>
            <Controller
              name="campaignId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={campaignOptions}
                  placeholder="Link a campaign…"
                  searchPlaceholder="Search campaigns…"
                  onSearchChange={setCampaignQuery}
                  isLoading={isSearchingCampaigns}
                  error={!!errors.campaignId}
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Schedule">
          <FormRow label="Scheduled Start" required error={errors.scheduledStart?.message}>
            <DateTimeInput {...register('scheduledStart')} />
          </FormRow>
          <FormRow label="Scheduled End" error={errors.scheduledEnd?.message}>
            <DateTimeInput {...register('scheduledEnd')} />
          </FormRow>
        </FormSection>

        <FormSection title="Call Details">
          <div className="sm:col-span-2">
            <FormRow label="Call Objectives" error={errors.callObjectives?.message}>
              <TextareaWithCounter
                {...register('callObjectives')}
                placeholder="What do you aim to achieve in this visit?"
                rows={3}
                maxLength={2000}
              />
            </FormRow>
          </div>
          <div className="sm:col-span-2">
            <FormRow label="Notes" error={errors.notes?.message}>
              <TextareaWithCounter
                {...register('notes')}
                placeholder="Any additional notes…"
                rows={2}
                maxLength={2000}
              />
            </FormRow>
          </div>
        </FormSection>

        {/* Sticky footer */}
        <div className="sticky bottom-0 -mx-6 border-t border-border/50 bg-background/95 backdrop-blur-sm px-6 py-3 flex items-center justify-end gap-3">
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
