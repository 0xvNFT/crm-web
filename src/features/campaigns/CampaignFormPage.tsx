import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useCreateCampaign,
  useUpdateCampaign,
  useCampaign,
} from '@/api/endpoints/campaigns'
import { useStaffSearch } from '@/api/endpoints/users'
import { useTerritorySearch } from '@/api/endpoints/territories'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useDebounce } from '@/hooks/useDebounce'
import { campaignFormSchema, type CampaignFormData } from '@/schemas/campaigns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter'
import { FormRow } from '@/components/shared/FormRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { FormPageSkeleton } from '@/components/shared/FormPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { FormSection } from '@/components/shared/FormSection'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PharmaCampaign, CreateCampaignRequest, UpdateCampaignRequest } from '@/api/app-types'

// ─── Inner form — rendered only after data is ready so defaultValues are stable ───
interface CampaignFormProps {
  campaign?: PharmaCampaign
  isEdit: boolean
  id?: string
}

function CampaignForm({ campaign, isEdit, id }: CampaignFormProps) {
  const navigate = useNavigate()

  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaign()
  const { mutate: updateCampaign, isPending: isUpdating } = useUpdateCampaign(id ?? '')
  const isPending = isCreating || isUpdating

  const [ownerQuery, setOwnerQuery]         = useState('')
  const [territoryQuery, setTerritoryQuery] = useState('')
  const debouncedOwnerQuery     = useDebounce(ownerQuery, 300)
  const debouncedTerritoryQuery = useDebounce(territoryQuery, 300)

  const { data: ownerResults,     isLoading: isSearchingOwners     } = useStaffSearch(debouncedOwnerQuery)
  const { data: territoryResults, isLoading: isSearchingTerritories } = useTerritorySearch(debouncedTerritoryQuery)

  const campaignTypeOptions = useConfigOptions('campaign.type')

  const ownerOptions: ComboboxOption[] = (ownerResults ?? []).map((u) => ({
    value: u.id!,
    label: u.fullName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
  }))
  const territoryOptions: ComboboxOption[] = (territoryResults ?? []).filter((t) => t.id).map((t) => ({
    value: t.id!,
    label: t.territoryName ?? t.id!,
  }))

  const selectedOwnerOption: ComboboxOption | undefined =
    isEdit && campaign?.ownerId
      ? { value: campaign.ownerId, label: campaign.ownerName ?? '' }
      : undefined

  const selectedTerritoryOption: ComboboxOption | undefined =
    isEdit && campaign?.territoryId
      ? { value: campaign.territoryId, label: campaign.territoryName ?? '' }
      : undefined

  const { register, handleSubmit, control, formState: { errors } } =
    useForm<CampaignFormData>({
      resolver: zodResolver(campaignFormSchema) as Resolver<CampaignFormData>,
      defaultValues:
        isEdit && campaign
          ? {
              name:        campaign.name        ?? '',
              description: campaign.description ?? '',
              type:        campaign.type        ?? undefined,
              startDate:   campaign.startDate   ?? '',
              endDate:     campaign.endDate     ?? '',
              budget:      campaign.budget != null ? Number(campaign.budget) : undefined,
              ownerId:     campaign.ownerId     ?? undefined,
              territoryId: campaign.territoryId ?? undefined,
            }
          : {
              name: '', description: '', type: undefined,
              startDate: '', endDate: '',
              budget: undefined, ownerId: undefined, territoryId: undefined,
            },
    })

  function onSubmit(data: CampaignFormData) {
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined),
    )
    if (isEdit) {
      updateCampaign(payload as UpdateCampaignRequest, {
        onSuccess: () => { toast('Campaign updated', { variant: 'success' }); navigate(`/campaigns/${id}`) },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    } else {
      createCampaign(payload as CreateCampaignRequest, {
        onSuccess: (created) => { toast('Campaign created', { variant: 'success' }); navigate(`/campaigns/${created.id}`) },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormSection title="Campaign Details">
        <FormRow label="Name" required fieldId="name" error={errors.name?.message}>
          <Input
            id="name"
            {...register('name')}
            placeholder="e.g. Q2 Cardiology Detailing Drive"
          />
        </FormRow>

        <FormRow label="Type" error={errors.type?.message}>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {campaignTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormRow>

        <FormRow label="Owner" error={errors.ownerId?.message}>
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
                searchPlaceholder="Type a name…"
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
                placeholder="Search territories…"
                searchPlaceholder="Type a territory name…"
                onSearchChange={setTerritoryQuery}
                isLoading={isSearchingTerritories}
                error={!!errors.territoryId}
              />
            )}
          />
        </FormRow>
      </FormSection>

      <FormSection title="Timeline & Budget">
        <FormRow label="Start Date" fieldId="startDate" error={errors.startDate?.message}>
          <DateInput id="startDate" {...register('startDate')} />
        </FormRow>

        <FormRow label="End Date" fieldId="endDate" error={errors.endDate?.message}>
          <DateInput id="endDate" {...register('endDate')} />
        </FormRow>

        <FormRow label="Budget" fieldId="budget" error={errors.budget?.message}>
          <Input
            id="budget"
            {...register('budget')}
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
          />
        </FormRow>
      </FormSection>

      <FormSection title="Description" noGrid>
        <FormRow label="Description" fieldId="description" error={errors.description?.message}>
          <TextareaWithCounter
            id="description"
            {...register('description')}
            maxLength={2000}
            rows={4}
            placeholder="Describe the campaign objective, strategy, and target audience…"
          />
        </FormRow>
      </FormSection>

      {/* Sticky footer — canonical pattern: right-aligned, Cancel first, Submit last */}
      <div className="sticky bottom-0 -mx-6 border-t border-border/50 bg-background/95 backdrop-blur-sm px-6 py-3 flex items-center justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEdit ? 'Saving…' : 'Creating…'
            : isEdit ? 'Save Changes' : 'Create Campaign'}
        </Button>
      </div>
    </form>
  )
}

// ─── Outer wrapper — loads data, then mounts inner form with stable defaultValues ───
export default function CampaignFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: campaign, isLoading, isError } = useCampaign(id ?? '')

  if (isLoading && isEdit) return <FormPageSkeleton />
  if (isError && isEdit) return <ErrorMessage message="Campaign not found." />

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? 'Edit Campaign' : 'New Campaign'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Update campaign details' : 'Create a new promotional campaign'}
          </p>
        </div>
      </div>
      <CampaignForm campaign={campaign} isEdit={isEdit} id={id} />
    </div>
  )
}
