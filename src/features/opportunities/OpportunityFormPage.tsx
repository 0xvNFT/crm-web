import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateOpportunity, useUpdateOpportunity, useOpportunity } from '@/api/endpoints/opportunities'
import { useAccountSearch } from '@/api/endpoints/accounts'
import { useStaffSearch } from '@/api/endpoints/users'
import { useTerritorySearch } from '@/api/endpoints/territories'
import { useConfig } from '@/api/endpoints/config'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useDebounce } from '@/hooks/useDebounce'
import { opportunityFormSchema, type OpportunityFormData } from '@/schemas/opportunities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FormRow } from '@/components/shared/FormRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PharmaOpportunity, CreateOpportunityRequest, UpdateOpportunityRequest } from '@/api/app-types'

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

// Rendered only after data + config are ready — defaultValues are stable on first useForm call
function OpportunityForm({ opportunity, isEdit }: { opportunity?: PharmaOpportunity; isEdit: boolean }) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { mutate: createOpportunity, isPending: isCreating } = useCreateOpportunity()
  const { mutate: updateOpportunity, isPending: isUpdating } = useUpdateOpportunity(id ?? '')
  const isPending = isCreating || isUpdating

  const [ownerQuery, setOwnerQuery] = useState('')
  const [accountQuery, setAccountQuery] = useState('')
  const [territoryQuery, setTerritoryQuery] = useState('')
  const debouncedOwnerQuery     = useDebounce(ownerQuery, 300)
  const debouncedAccountQuery   = useDebounce(accountQuery, 300)
  const debouncedTerritoryQuery = useDebounce(territoryQuery, 300)

  const { data: ownerResults,     isLoading: isSearchingOwners     } = useStaffSearch(debouncedOwnerQuery)
  const { data: accountResults,   isLoading: isSearchingAccounts   } = useAccountSearch(debouncedAccountQuery)
  const { data: territoryResults, isLoading: isSearchingTerritories } = useTerritorySearch(debouncedTerritoryQuery)

  const salesStageOptions        = useConfigOptions('opportunity.salesStage')
  const forecastCategoryOptions  = useConfigOptions('opportunity.forecastCategory')
  const opportunityStatusOptions = useConfigOptions('opportunity.status')
  const leadSourceOptions        = useConfigOptions('lead.source')
  const opportunityTypeOptions   = useConfigOptions('opportunity.type')

  const ownerOptions: ComboboxOption[] = (ownerResults ?? []).map((u) => ({
    value: u.id!,
    label: (u.fullName ?? u.email ?? '') as string,
  }))
  const accountOptions: ComboboxOption[] = (accountResults ?? []).map((a) => ({
    value: a.id!,
    label: a.name ?? '',
  }))
  const territoryOptions: ComboboxOption[] = (territoryResults ?? []).filter((t) => t.id).map((t) => ({
    value: t.id!,
    label: t.territoryName ?? t.id!,
  }))
  const selectedTerritoryOption: ComboboxOption | undefined = isEdit && opportunity?.territoryId
    ? { value: opportunity.territoryId, label: opportunity.territoryName ?? '' }
    : undefined

  // Combobox selectedOption — provides label before search runs in edit mode
  const selectedOwnerOption: ComboboxOption | undefined = isEdit && opportunity?.ownerId
    ? { value: opportunity.ownerId, label: opportunity.ownerName ?? '' }
    : undefined
  // Account is read-only in edit (backend rejects accountId changes) — show as Combobox for create only
  const selectedAccountOption: ComboboxOption | undefined = isEdit && opportunity?.accountId
    ? { value: opportunity.accountId, label: opportunity.accountName ?? '' }
    : undefined

  const { register, handleSubmit, control, formState: { errors } } = useForm<OpportunityFormData>({
    // Why: RHF v7 infers Resolver<FieldValues> from zodResolver; cast narrows to the concrete form type
    resolver: zodResolver(opportunityFormSchema) as Resolver<OpportunityFormData>,
    defaultValues: isEdit && opportunity ? {
      topic:            opportunity.topic ?? '',
      description:      opportunity.description ?? '',
      accountId:        opportunity.accountId ?? '',
      ownerId:          opportunity.ownerId ?? '',
      territoryId:      opportunity.territoryId ?? '',
      salesStage:       opportunity.salesStage ?? undefined,
      status:           opportunity.status ?? undefined,
      forecastCategory: opportunity.forecastCategory ?? undefined,
      estRevenue:       opportunity.estRevenue != null ? Number(opportunity.estRevenue) : undefined,
      probabilityPct:   opportunity.probabilityPct != null ? Number(opportunity.probabilityPct) : undefined,
      currency:         opportunity.currency ?? '',
      estCloseDate:     opportunity.estCloseDate ?? '',
      actualCloseDate:  opportunity.actualCloseDate ?? '',
      leadSource:       opportunity.leadSource ?? undefined,
      type:             opportunity.type ?? undefined,
      budgetConfirmed:  opportunity.budgetConfirmed ?? false,
    } : {
      budgetConfirmed: false,
    },
  })

  function onSubmit(data: OpportunityFormData) {
    if (isEdit) {
      // Strip empty strings — backend rejects "" for optional fields
      // Why: Object.fromEntries loses static type info; shape is guaranteed by Zod opportunitySchema
      const payload: UpdateOpportunityRequest = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
      ) as UpdateOpportunityRequest
      updateOpportunity(payload, {
        onSuccess: () => {
          toast('Opportunity updated', { variant: 'success' })
          navigate(`/opportunities/${id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    } else {
      // Why: data matches schema shape directly; widened union fields are string in CreateOpportunityRequest
      createOpportunity(data as CreateOpportunityRequest, {
        onSuccess: (created) => {
          toast('Opportunity created', { variant: 'success' })
          navigate(`/opportunities/${created.id}`)
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
          title={isEdit ? 'Edit Opportunity' : 'New Opportunity'}
          description={isEdit ? 'Update opportunity details' : 'Create a new sales opportunity'}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Overview">
          <FormRow label="Topic" required error={errors.topic?.message}>
            <Input {...register('topic')} placeholder="e.g. Hospital Network Expansion" />
          </FormRow>
          <FormRow label="Type" error={errors.type?.message}>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {opportunityTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Stage" error={errors.salesStage?.message}>
            <Controller
              name="salesStage"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                  disabled={isEdit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isEdit ? (opportunity?.salesStage ?? '—') : 'Select stage'} />
                  </SelectTrigger>
                  <SelectContent>
                    {salesStageOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Forecast Category" error={errors.forecastCategory?.message}>
            <Controller
              name="forecastCategory"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select forecast" /></SelectTrigger>
                  <SelectContent>
                    {forecastCategoryOptions.map((opt) => (
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
                    {opportunityStatusOptions.map((opt) => (
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
                  <SelectTrigger><SelectValue placeholder="Select lead source" /></SelectTrigger>
                  <SelectContent>
                    {leadSourceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="budgetConfirmed"
              {...register('budgetConfirmed')}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <Label htmlFor="budgetConfirmed" className="text-sm text-foreground cursor-pointer">
              Budget Confirmed
            </Label>
          </div>
        </FormSection>

        <FormSection title="Financials">
          <FormRow label="Est. Revenue" error={errors.estRevenue?.message}>
            <Input {...register('estRevenue')} type="number" min={0} step={0.01} placeholder="0.00" />
          </FormRow>
          <FormRow label="Probability (%)" error={errors.probabilityPct?.message}>
            <Input {...register('probabilityPct')} type="number" min={0} max={100} placeholder="0" />
          </FormRow>
          <FormRow label="Currency" error={errors.currency?.message}>
            <Input {...register('currency')} placeholder="e.g. PHP" />
          </FormRow>
          <FormRow label="Est. Close Date" error={errors.estCloseDate?.message}>
            <Input {...register('estCloseDate')} type="date" />
          </FormRow>
          <FormRow label="Actual Close Date" error={errors.actualCloseDate?.message}>
            <Input {...register('actualCloseDate')} type="date" />
          </FormRow>
        </FormSection>

        <FormSection title="Relationships">
          <FormRow label="Account" required error={errors.accountId?.message}>
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={accountOptions}
                  selectedOption={selectedAccountOption}
                  placeholder="Search accounts…"
                  onSearchChange={setAccountQuery}
                  isLoading={isSearchingAccounts}
                  error={!!errors.accountId}
                />
              )}
            />
          </FormRow>
          <FormRow label="Owner" required error={errors.ownerId?.message}>
            <Controller
              name="ownerId"
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
                  error={!!errors.ownerId}
                />
              )}
            />
          </FormRow>
          <FormRow label="Territory" error={errors.territoryId?.message}>
            <Controller
              name="territoryId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={territoryOptions}
                  selectedOption={selectedTerritoryOption}
                  placeholder="Search territory…"
                  onSearchChange={setTerritoryQuery}
                  isLoading={isSearchingTerritories}
                />
              )}
            />
          </FormRow>
        </FormSection>

        <div className="rounded-xl border bg-background p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Description</h2>
          <Textarea {...register('description')} rows={4} placeholder="Notes about this opportunity…" />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Opportunity')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function OpportunityFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { data: opportunity, isLoading: isLoadingOpportunity } = useOpportunity(id ?? '')
  const { isLoading: isLoadingConfig } = useConfig()

  if (isLoadingConfig || (isEdit && isLoadingOpportunity)) return <LoadingSpinner />

  return <OpportunityForm opportunity={opportunity} isEdit={isEdit} />
}
