import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateTerritory } from '@/api/endpoints/territories'
import { useStaffSearch } from '@/api/endpoints/users'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { FormRow } from '@/components/shared/FormRow'
import { PageHeader } from '@/components/shared/PageHeader'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { createTerritorySchema, type CreateTerritoryFormData } from '@/schemas/territories'

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

export default function TerritoryFormPage() {
  const navigate = useNavigate()
  const { mutate: createTerritory, isPending } = useCreateTerritory()
  const regionOptions = useConfigOptions('territory.region')
  const territoryStatusOptions = useConfigOptions('territory.status')

  const [repQuery, setRepQuery] = useState('')
  const [managerQuery, setManagerQuery] = useState('')
  const debouncedRepQuery = useDebounce(repQuery, 300)
  const debouncedManagerQuery = useDebounce(managerQuery, 300)
  const { data: repResults, isLoading: isSearchingReps } = useStaffSearch(debouncedRepQuery)
  const { data: managerResults, isLoading: isSearchingManagers } = useStaffSearch(debouncedManagerQuery)

  const repOptions: ComboboxOption[] = (repResults ?? []).map((u) => ({
    value: u.id!,
    label: u.fullName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
  }))
  const managerOptions: ComboboxOption[] = (managerResults ?? []).map((u) => ({
    value: u.id!,
    label: u.fullName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
  }))

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateTerritoryFormData>({
    resolver: zodResolver(createTerritorySchema) as Resolver<CreateTerritoryFormData>,
    defaultValues: { status: 'active' },
  })

  function onSubmit(data: CreateTerritoryFormData) {
    createTerritory(data, {
      onSuccess: (territory) => {
        toast('Territory created', { variant: 'success' })
        navigate(`/territories/${territory.id}`)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title="New Territory" description="Define a new sales territory" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormSection title="Territory Info">
          <FormRow label="Territory Code" required error={errors.territoryCode?.message}>
            <Input {...register('territoryCode')} placeholder="e.g. NCR-01" autoFocus />
          </FormRow>
          <FormRow label="Territory Name" required error={errors.territoryName?.message}>
            <Input {...register('territoryName')} placeholder="e.g. Metro Manila North" />
          </FormRow>
          <FormRow label="Region" required error={errors.region?.message}>
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((opt) => (
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
                <Select value={field.value || 'active'} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {territoryStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
          <FormRow label="Effective From" error={errors.effectiveFrom?.message}>
            <Input {...register('effectiveFrom')} type="date" />
          </FormRow>
          <div className="sm:col-span-2">
            <FormRow label="Description" error={errors.description?.message}>
              <Textarea {...register('description')} placeholder="Optional description" rows={3} />
            </FormRow>
          </div>
        </FormSection>

        <FormSection title="Assignments">
          <FormRow label="Primary Rep" error={errors.primaryRepId?.message}>
            <Controller
              name="primaryRepId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={repOptions}
                  placeholder="Search staff…"
                  onSearchChange={setRepQuery}
                  isLoading={isSearchingReps}
                />
              )}
            />
          </FormRow>
          <FormRow label="Manager" error={errors.managerId?.message}>
            <Controller
              name="managerId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  options={managerOptions}
                  placeholder="Search staff…"
                  onSearchChange={setManagerQuery}
                  isLoading={isSearchingManagers}
                />
              )}
            />
          </FormRow>
        </FormSection>

        <FormSection title="Targets">
          <FormRow label="Target Revenue (Annual)" error={errors.targetRevenueAnnual?.message}>
            <Input
              {...register('targetRevenueAnnual')}
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
            />
          </FormRow>
          <FormRow label="Target Visits (Monthly)" error={errors.targetVisitsMonthly?.message}>
            <Input
              {...register('targetVisitsMonthly')}
              type="number"
              min={0}
              step={1}
              placeholder="0"
            />
          </FormRow>
          <FormRow
            label="Target New Accounts (Quarterly)"
            error={errors.targetNewAccountsQuarterly?.message}
          >
            <Input
              {...register('targetNewAccountsQuarterly')}
              type="number"
              min={0}
              step={1}
              placeholder="0"
            />
          </FormRow>
        </FormSection>

        {/* Sticky footer */}
        <div className="sticky bottom-0 -mx-6 border-t bg-background px-6 py-3 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating…' : 'Create Territory'}
          </Button>
        </div>
      </form>
    </div>
  )
}
