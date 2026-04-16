import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { repTargetSchema, type RepTargetFormData } from '@/schemas/rep-targets'
import { useRepTargets, useCreateRepTarget, useUpdateRepTarget, useDeleteRepTarget } from '@/api/endpoints/rep-targets'
import { useStaffSearch } from '@/api/endpoints/users'
import { useTerritorySearch } from '@/api/endpoints/territories'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormRow } from '@/components/shared/FormRow'
import { FormSection } from '@/components/shared/FormSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { useRole } from '@/hooks/useRole'
import { CURRENT_YEAR, CURRENT_MONTH, MONTHS } from './components/kpi-constants'
import type { RepTarget } from '@/api/app-types'

// ─── Form ─────────────────────────────────────────────────────────────────────

interface AddTargetFormProps {
  year: number
  month: number
}

function AddTargetForm({ year, month }: AddTargetFormProps) {
  const [repQuery, setRepQuery] = useState('')
  const [territoryQuery, setTerritoryQuery] = useState('')
  const debouncedRepQuery = useDebounce(repQuery, 300)
  const debouncedTerritoryQuery = useDebounce(territoryQuery, 300)
  const { data: repResults, isLoading: isSearchingReps } = useStaffSearch(debouncedRepQuery)
  const { data: territoryResults, isLoading: isSearchingTerritories } = useTerritorySearch(debouncedTerritoryQuery)

  const repOptions = (repResults ?? [])
    .filter((u) => u.id)
    .map((u) => ({ value: u.id!, label: u.fullName ?? u.email ?? u.id! }))

  const territoryOptions = (territoryResults ?? [])
    .filter((t) => t.id)
    .map((t) => ({ value: t.id!, label: t.territoryName ?? t.id! }))

  const { mutate: createTarget, isPending } = useCreateRepTarget()

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<RepTargetFormData>({
    resolver: zodResolver(repTargetSchema),
    defaultValues: { repId: '', territoryId: '', targetVisits: undefined, targetContacts: undefined, targetCalls: undefined },
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormSection title="Add / Update Target">
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
                placeholder="Search territory..."
                searchPlaceholder="Type territory name..."
                onSearchChange={setTerritoryQuery}
                isLoading={isSearchingTerritories}
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

        <div className="sm:col-span-2">
          <Button type="submit" size="sm" disabled={isPending}>
            <Plus className="h-4 w-4 mr-1.5" />
            {isPending ? 'Saving…' : 'Set Target'}
          </Button>
        </div>
      </FormSection>
    </form>
  )
}

// ─── Targets table row (with inline edit) ─────────────────────────────────────

interface TargetRowProps {
  target: RepTarget
  canEdit: boolean
}

function TargetRow({ target: t, canEdit }: TargetRowProps) {
  const [editing, setEditing] = useState(false)
  const [visits, setVisits] = useState(String(t.targetVisits ?? ''))
  const [contacts, setContacts] = useState(String(t.targetContacts ?? ''))
  const [calls, setCalls] = useState(String(t.targetCalls ?? ''))
  const [showDelete, setShowDelete] = useState(false)

  const { mutate: updateTarget, isPending: isUpdating } = useUpdateRepTarget()
  const { mutate: deleteTarget, isPending: isDeleting } = useDeleteRepTarget()

  const repName = t.repName ?? '—'

  function saveEdit() {
    const v = Number(visits)
    const c = Number(contacts)
    const k = Number(calls)
    if (!Number.isInteger(v) || v < 1 || !Number.isInteger(c) || c < 1 || !Number.isInteger(k) || k < 1) {
      toast('All targets must be whole numbers greater than 0', { variant: 'destructive' })
      return
    }
    updateTarget(
      { id: t.id!, data: { targetVisits: v, targetContacts: c, targetCalls: k } },
      {
        onSuccess: () => { toast('Target updated', { variant: 'success' }); setEditing(false) },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      }
    )
  }

  function cancelEdit() {
    setVisits(String(t.targetVisits ?? ''))
    setContacts(String(t.targetContacts ?? ''))
    setCalls(String(t.targetCalls ?? ''))
    setEditing(false)
  }

  return (
    <>
      <tr className="hover:bg-muted/20">
        <td className="px-4 py-3 font-medium">{repName}</td>
        <td className="px-4 py-3 text-muted-foreground">{t.territoryName ?? '—'}</td>

        {editing ? (
          <>
            <td className="px-4 py-2 text-right">
              <Input type="number" min={1} value={visits} onChange={(e) => setVisits(e.target.value)} className="h-7 w-20 text-right ml-auto" />
            </td>
            <td className="px-4 py-2 text-right">
              <Input type="number" min={1} value={contacts} onChange={(e) => setContacts(e.target.value)} className="h-7 w-20 text-right ml-auto" />
            </td>
            <td className="px-4 py-2 text-right">
              <Input type="number" min={1} value={calls} onChange={(e) => setCalls(e.target.value)} className="h-7 w-20 text-right ml-auto" />
            </td>
            <td className="px-4 py-2 text-right">
              <div className="flex items-center justify-end gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveEdit} disabled={isUpdating}>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancelEdit}>
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </td>
          </>
        ) : (
          <>
            <td className="px-4 py-3 text-right">{t.targetVisits}</td>
            <td className="px-4 py-3 text-right">{t.targetContacts}</td>
            <td className="px-4 py-3 text-right">{t.targetCalls}</td>
            {canEdit && (
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(true)}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowDelete(true)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </td>
            )}
          </>
        )}
      </tr>

      <ConfirmDialog
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={() => deleteTarget(t.id!, {
          onSuccess: () => { toast('Target deleted', { variant: 'success' }) },
          onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
        })}
        title="Delete Target?"
        description="This will remove the target for this rep and territory for the selected period."
        confirmLabel="Delete"
        isPending={isDeleting}
      />
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RepTargetsPage() {
  const navigate = useNavigate()
  const { isAdmin, isManager } = useRole()
  const canEdit = isAdmin || isManager

  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)

  const { data: targetsPage, isLoading } = useRepTargets(year, month)
  const targets = targetsPage?.content ?? []

  return (
    <div className="space-y-5 max-w-4xl">
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

      {/* Add target form — MANAGER+ only */}
      {canEdit && <AddTargetForm year={year} month={month} />}

      {/* Existing targets table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
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
                  {canEdit && <th className="px-4 py-2.5 text-right font-medium text-muted-foreground"></th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {targets.map((t) => (
                  <TargetRow key={t.id} target={t} canEdit={canEdit} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
