import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, X, Check, Building2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTerritory, useUpdateTerritory, useTerritoryAccounts } from '@/api/endpoints/territories'
import { useStaffSearch } from '@/api/endpoints/users'
import { useRole } from '@/hooks/useRole'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useDebounce } from '@/hooks/useDebounce'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FormRow } from '@/components/shared/FormRow'
import { formatDate, formatCurrency } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { updateTerritorySchema, type UpdateTerritoryFormData } from '@/schemas/territories'
import type { PharmaAccountTerritory } from '@/api/app-types'

// ─── Sub-components ────────────────────────────────────────────────────────────
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : String(value)

  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  )
}

const accountColumns: Column<PharmaAccountTerritory>[] = [
  { header: 'Name', accessor: (row) => row.accountName ?? '—' },
]

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function TerritoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const { isManager } = useRole()

  const [repQuery, setRepQuery] = useState('')
  const [managerQuery, setManagerQuery] = useState('')
  const debouncedRepQuery = useDebounce(repQuery, 300)
  const debouncedManagerQuery = useDebounce(managerQuery, 300)

  const { data: territory, isLoading, isError } = useTerritory(id ?? '')
  const { mutate: updateTerritory, isPending } = useUpdateTerritory(id ?? '')
  const { data: accounts, isLoading: isLoadingAccounts } = useTerritoryAccounts(id ?? '')
  const { data: repResults, isLoading: isSearchingReps } = useStaffSearch(debouncedRepQuery)
  const { data: managerResults, isLoading: isSearchingManagers } = useStaffSearch(debouncedManagerQuery)
  const regionOptions = useConfigOptions('territory.region')
  const territoryStatusOptions = useConfigOptions('territory.status')

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
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateTerritoryFormData>({
    resolver: zodResolver(updateTerritorySchema),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError || !territory) return <ErrorMessage message="Territory not found." />

  function startEdit() {
    reset({
      territoryCode: territory?.territoryCode ?? '',
      territoryName: territory?.territoryName ?? '',
      region: territory?.region ?? undefined,
      description: territory?.description ?? '',
      status: territory?.status ?? undefined,
      effectiveFrom: territory?.effectiveFrom ?? '',
      primaryRepId: territory?.primaryRepId ?? undefined,
      managerId: territory?.managerId ?? undefined,
      targetRevenueAnnual: territory?.targetRevenueAnnual != null ? Number(territory.targetRevenueAnnual) : undefined,
      targetVisitsMonthly: territory?.targetVisitsMonthly ?? undefined,
      targetNewAccountsQuarterly: territory?.targetNewAccountsQuarterly ?? undefined,
    })
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    reset()
  }

  function onSubmit(data: UpdateTerritoryFormData) {
    updateTerritory(data, {
      onSuccess: () => {
        toast('Territory updated', { variant: 'success' })
        setEditing(false)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{territory.territoryName}</h1>
            <StatusBadge status={(territory.status ?? 'active').toUpperCase()} />
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>{territory.territoryCode}</span>
            {territory.region && (
              <>
                <span>·</span>
                <span>{territory.region}</span>
              </>
            )}
          </div>
        </div>

        {!editing && isManager && (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        )}
      </div>

      {/* View mode */}
      {!editing && (
        <div className="space-y-4">
          <DetailSection title="Territory Info">
            <DetailField label="Territory Code" value={territory.territoryCode} />
            <DetailField label="Territory Name" value={territory.territoryName} />
            <DetailField label="Region" value={territory.region} />
            <DetailField label="Description" value={territory.description} />
            <DetailField label="Effective From" value={formatDate(territory.effectiveFrom)} />
            <DetailField label="Created" value={formatDate(territory.createdAt)} />
          </DetailSection>

          <DetailSection title="Assignment">
            <DetailField label="Primary Rep" value={territory.primaryRepName} />
            <DetailField label="Manager" value={territory.managerName} />
          </DetailSection>

          <DetailSection title="Targets">
            <DetailField
              label="Target Revenue (Annual)"
              value={territory.targetRevenueAnnual != null ? formatCurrency(territory.targetRevenueAnnual) : undefined}
            />
            <DetailField label="Target Visits (Monthly)" value={territory.targetVisitsMonthly} />
            <DetailField label="Target New Accounts (Quarterly)" value={territory.targetNewAccountsQuarterly} />
          </DetailSection>

          <DetailSection title="Metrics">
            <DetailField label="Total Accounts" value={territory.totalAccountsCount} />
            <DetailField label="Active Accounts" value={territory.activeAccountsCount} />
            <DetailField label="Total HCPs" value={territory.totalHcpsCount} />
            <DetailField label="Total Visits (YTD)" value={territory.totalVisitsYtd} />
          </DetailSection>

          {/* Accounts in Territory sub-section */}
          <div className="rounded-xl border bg-background p-5 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Accounts in Territory
            </h2>
            {isLoadingAccounts ? (
              <LoadingSpinner />
            ) : (
              <DataTable
                columns={accountColumns}
                data={accounts ?? []}
                onRowClick={(row) => navigate(`/accounts/${row.accountId}`)}
                empty={{
                  icon: Building2,
                  title: 'No accounts in this territory',
                  description: 'Accounts will appear here once assigned to this territory.',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-xl border bg-background p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Edit Territory</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="Territory Code" error={errors.territoryCode?.message}>
                <Input {...register('territoryCode')} />
              </FormRow>
              <FormRow label="Territory Name" error={errors.territoryName?.message}>
                <Input {...register('territoryName')} />
              </FormRow>
              <FormRow label="Region" error={errors.region?.message}>
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
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
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
              <FormRow label="Target Revenue (Annual)" error={errors.targetRevenueAnnual?.message}>
                <Input {...register('targetRevenueAnnual')} type="number" min="0" step="0.01" placeholder="0.00" />
              </FormRow>
              <FormRow label="Target Visits (Monthly)" error={errors.targetVisitsMonthly?.message}>
                <Input {...register('targetVisitsMonthly')} type="number" min="0" step="1" placeholder="0" />
              </FormRow>
              <FormRow label="Target New Accounts (Quarterly)" error={errors.targetNewAccountsQuarterly?.message}>
                <Input {...register('targetNewAccountsQuarterly')} type="number" min="0" step="1" placeholder="0" />
              </FormRow>
              <div className="sm:col-span-2">
                <FormRow label="Description" error={errors.description?.message}>
                  <Textarea {...register('description')} rows={3} />
                </FormRow>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-background p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Assignments</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button type="button" variant="outline" onClick={cancelEdit} disabled={isPending}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
