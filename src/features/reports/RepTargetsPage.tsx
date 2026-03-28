import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Plus } from 'lucide-react'
import { repTargetSchema, type RepTargetFormData } from '@/schemas/rep-targets'
import { useRepTargets, useCreateRepTarget } from '@/api/endpoints/rep-targets'
import { useStaffSearch } from '@/api/endpoints/users'
import { useTerritories } from '@/api/endpoints/territories'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormRow } from '@/components/shared/FormRow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ─── Form ─────────────────────────────────────────────────────────────────────

interface AddTargetFormProps {
  year: number
  month: number
}

function AddTargetForm({ year, month }: AddTargetFormProps) {
  const [repQuery, setRepQuery] = useState('')
  const debouncedRepQuery = useDebounce(repQuery, 300)
  const { data: repResults, isLoading: isSearchingReps } = useStaffSearch(debouncedRepQuery)
  const { data: territoriesData } = useTerritories(0, 100)

  const repOptions = (repResults ?? [])
    .filter((u) => u.id)
    .map((u) => ({ value: u.id!, label: u.fullName ?? u.email ?? u.id! }))

  const territoryOptions = (territoriesData?.content ?? [])
    .filter((t) => t.id)
    .map((t) => ({ value: t.id!, label: t.territoryName ?? t.id! }))

  const { mutate: createTarget, isPending } = useCreateRepTarget()

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<RepTargetFormData>({
    resolver: zodResolver(repTargetSchema),
    defaultValues: { repId: '', territoryId: '', targetVisits: 130, targetContacts: 70, targetCalls: 130 },
  })

  function onSubmit(data: RepTargetFormData) {
    createTarget({ ...data, year, month }, {
      onSuccess: () => {
        toast('Target set', { variant: 'success' })
        reset()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Add / Update Target</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormRow label="Rep" required error={errors.repId?.message}>
          <Controller
            name="repId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value}
                onChange={field.onChange}
                options={repOptions}
                placeholder="Search rep..."
                searchPlaceholder="Type rep name..."
                onSearchChange={setRepQuery}
                isLoading={isSearchingReps}
                error={!!errors.repId}
              />
            )}
          />
        </FormRow>

        <FormRow label="Territory" required error={errors.territoryId?.message}>
          <Controller
            name="territoryId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value}
                onChange={field.onChange}
                options={territoryOptions}
                placeholder="Select territory..."
                searchPlaceholder="Type territory name..."
                error={!!errors.territoryId}
              />
            )}
          />
        </FormRow>

        <FormRow label="Target Visits" required error={errors.targetVisits?.message}>
          <Input type="number" min={1} {...register('targetVisits')} className={errors.targetVisits ? 'border-destructive' : ''} />
        </FormRow>

        <FormRow label="Target Contacts (Doctors)" required error={errors.targetContacts?.message}>
          <Input type="number" min={1} {...register('targetContacts')} className={errors.targetContacts ? 'border-destructive' : ''} />
        </FormRow>

        <FormRow label="Target Calls" required error={errors.targetCalls?.message}>
          <Input type="number" min={1} {...register('targetCalls')} className={errors.targetCalls ? 'border-destructive' : ''} />
        </FormRow>
      </div>

      <Button type="submit" size="sm" disabled={isPending}>
        <Plus className="h-4 w-4 mr-1.5" />
        {isPending ? 'Saving...' : 'Set Target'}
      </Button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RepTargetsPage() {
  const navigate = useNavigate()
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)

  const { data: targetsPage, isLoading } = useRepTargets(year, month)
  const targets = targetsPage?.content ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Rep Targets"
        description="Set monthly visit, contact, and call targets per rep per territory"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/reports/kpi')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            KPI Reports
          </Button>
        }
      />

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Year</span>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="h-8 w-24 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[CURRENT_YEAR - 1, CURRENT_YEAR].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Month</span>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((name, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Add target form */}
      <AddTargetForm year={year} month={month} />

      {/* Existing targets table */}
      <div className="rounded-xl border bg-background overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-sm font-semibold text-foreground">
            Targets — {MONTHS[month - 1]} {year}
          </h2>
        </div>

        {isLoading ? (
          <div className="py-10"><LoadingSpinner /></div>
        ) : targets.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No targets set for this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Rep</th>
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Territory</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Target Visits</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Target Contacts</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Target Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {targets.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">
                      {t.rep?.fullName
                        ?? ([t.rep?.firstName, t.rep?.lastName].filter(Boolean).join(' ') || t.rep?.email)
                        ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.territory?.territoryName ?? '—'}</td>
                    <td className="px-4 py-3 text-right">{t.targetVisits}</td>
                    <td className="px-4 py-3 text-right">{t.targetContacts}</td>
                    <td className="px-4 py-3 text-right">{t.targetCalls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
