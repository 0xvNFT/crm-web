import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, X, Check, TrendingUp } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useOpportunity, useUpdateOpportunity, useAdvanceOpportunityStage } from '@/api/endpoints/opportunities'
import { useRole } from '@/hooks/useRole'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EntityHistorySection } from '@/components/shared/EntityHistorySection'
import { EntityNotesSection } from '@/components/shared/EntityNotesSection'
import { EntityTagsSection } from '@/components/shared/EntityTagsSection'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter'
import { CheckboxField } from '@/components/shared/CheckboxField'
import { FormRow } from '@/components/shared/FormRow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatCurrency, formatLabel } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { opportunityEditSchema, type OpportunityEditFormData } from '@/schemas/opportunities'
import { OpportunityActivitiesSection } from './components/OpportunityActivitiesSection'
import { OpportunityVisitsSection } from './components/OpportunityVisitsSection'
import { DetailSection, DetailField } from '@/components/shared/DetailSection'

// ─── Stage pipeline strip ───────────────────────────────────────────────────────
const STAGE_ORDER = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

function StagePipeline({ current }: { current?: string }) {
  const activeIdx = current ? STAGE_ORDER.indexOf(current) : -1
  return (
    <div className="flex items-center gap-0 rounded-xl border bg-background overflow-hidden">
      {STAGE_ORDER.map((stage, i) => {
        const isActive  = stage === current
        const isPast    = activeIdx >= 0 && i < activeIdx
        const isLost    = stage === 'closed_lost'
        const isWon     = stage === 'closed_won'
        return (
          <div
            key={stage}
            className={[
              'flex-1 px-3 py-2.5 text-center text-xs font-medium transition-colors border-r last:border-r-0',
              isActive && isWon  ? 'bg-emerald-500 text-white' :
              isActive && isLost ? 'bg-destructive text-destructive-foreground' :
              isActive           ? 'bg-primary text-primary-foreground' :
              isPast             ? 'bg-muted/60 text-muted-foreground' :
                                   'bg-background text-muted-foreground/50',
            ].join(' ')}
          >
            {formatLabel(stage)}
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [stageTarget, setStageTarget] = useState<string | null>(null)

  const { data: opp, isLoading, isError } = useOpportunity(id ?? '')
  const { mutate: updateOpp, isPending } = useUpdateOpportunity(id ?? '')
  const { mutate: advanceStage, isPending: isAdvancing } = useAdvanceOpportunityStage(id ?? '')
  const { isReadOnly } = useRole()

  const salesStageOptions      = useConfigOptions('opportunity.salesStage')
  const forecastCategoryOptions = useConfigOptions('opportunity.forecastCategory')

  const { register, handleSubmit, reset, control, formState: { errors } } =
    useForm<OpportunityEditFormData>({ resolver: zodResolver(opportunityEditSchema) })

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !opp) return <ErrorMessage message="Opportunity not found." />


  function cancelEdit() {
    setEditing(false)
    reset()
  }

  function onSubmit(data: OpportunityEditFormData) {
    updateOpp(data, {
      onSuccess: () => {
        toast('Opportunity updated', { variant: 'success' })
        setEditing(false)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  function confirmAdvanceStage(stage: string) {
    setStageTarget(stage)
  }

  function handleAdvanceStage() {
    if (!stageTarget) return
    advanceStage({ stage: stageTarget }, {
      onSuccess: () => {
        toast(`Stage advanced to ${formatLabel(stageTarget)}`, { variant: 'success' })
        setStageTarget(null)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  // Next stage in the pipeline (not applicable for closed stages)
  const currentIdx = opp.salesStage ? STAGE_ORDER.indexOf(opp.salesStage) : -1
  const isClosed = opp.salesStage === 'closed_won' || opp.salesStage === 'closed_lost'
  const nextStage = !isClosed && currentIdx >= 0 && currentIdx < STAGE_ORDER.length - 1
    ? STAGE_ORDER[currentIdx + 1]
    : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{opp.topic}</h1>
            {opp.status && <StatusBadge status={opp.status} />}
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {opp.accountName && (
              <button
                onClick={() => navigate(`/accounts/${opp.accountId}`)}
                className="hover:text-foreground transition-colors hover:underline"
              >
                {opp.accountName}
              </button>
            )}
            {opp.ownerName && (
              <>
                <span>·</span>
                <span>{opp.ownerName}</span>
              </>
            )}
            {opp.estRevenue != null && (
              <>
                <span>·</span>
                <span className="font-medium text-foreground">{formatCurrency(opp.estRevenue)}</span>
              </>
            )}
          </div>
        </div>

        {!editing && !isReadOnly && (
          <div className="flex items-center gap-2 shrink-0">
            {nextStage && (
              <Button size="sm" onClick={() => confirmAdvanceStage(nextStage)}>
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                Advance to {formatLabel(nextStage)}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate(`/opportunities/${id}/edit`)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </div>
        )}
      </div>

      {/* Stage pipeline */}
      <StagePipeline current={opp.salesStage} />

      {/* View mode */}
      {!editing && (
        <div className="space-y-5">
          <DetailSection title="Overview">
            <DetailField label="Topic"            value={opp.topic} />
            <DetailField label="Stage"            value={formatLabel(opp.salesStage)} />
            <DetailField label="Status"           value={formatLabel(opp.status)} />
            <DetailField label="Forecast"         value={formatLabel(opp.forecastCategory)} />
            <DetailField label="Type"             value={opp.type} />
            <DetailField label="Lead Source"      value={opp.leadSource} />
            <DetailField label="Budget Confirmed" value={opp.budgetConfirmed} />
          </DetailSection>

          <DetailSection title="Financials">
            <DetailField label="Est. Revenue"    value={opp.estRevenue != null ? formatCurrency(opp.estRevenue) : undefined} />
            <DetailField label="Probability"     value={opp.probabilityPct != null ? `${opp.probabilityPct}%` : undefined} />
            <DetailField label="Currency"        value={opp.currency} />
            <DetailField label="Est. Close Date" value={formatDate(opp.estCloseDate)} />
            <DetailField label="Actual Close"    value={formatDate(opp.actualCloseDate)} />
          </DetailSection>

          <DetailSection title="Relationships">
            <DetailField label="Account"   value={opp.accountName} />
            <DetailField label="Contact"   value={opp.contactName} />
            <DetailField label="Owner"     value={opp.ownerName} />
            <DetailField label="Territory" value={opp.territoryName} />
          </DetailSection>

          {opp.description && (
            <div className="rounded-xl border border-border/60 bg-card p-5 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</h2>
              <p className="text-sm text-foreground whitespace-pre-wrap">{opp.description}</p>
            </div>
          )}

          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DetailField label="Opportunity ID" value={opp.id} />
              <DetailField label="Created"        value={formatDate(opp.createdAt)} />
              <DetailField label="Last Updated"   value={formatDate(opp.updatedAt)} />
            </div>
          </div>

          <OpportunityActivitiesSection opportunityId={opp.id ?? ''} />
          <OpportunityVisitsSection opportunityId={opp.id ?? ''} />
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Overview</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="Topic *" error={errors.topic?.message}>
                <Input {...register('topic')} />
              </FormRow>
              <FormRow label="Type" error={errors.type?.message}>
                <Input {...register('type')} placeholder="e.g. New Business" />
              </FormRow>
              <FormRow label="Stage">
                <Controller
                  name="salesStage"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                      <SelectContent>
                        {salesStageOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormRow>
              <FormRow label="Forecast Category">
                <Controller
                  name="forecastCategory"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
              <FormRow label="Lead Source">
                <Input {...register('leadSource')} placeholder="e.g. Referral" />
              </FormRow>
              <CheckboxField label="Budget Confirmed" id="budgetConfirmed" {...register('budgetConfirmed')} />
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Financials</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="Est. Revenue" error={errors.estRevenue?.message}>
                <Input {...register('estRevenue')} type="number" min={0} step={0.01} />
              </FormRow>
              <FormRow label="Probability (%)" error={errors.probabilityPct?.message}>
                <Input {...register('probabilityPct')} type="number" min={0} max={100} />
              </FormRow>
              <FormRow label="Currency">
                <Input {...register('currency')} placeholder="e.g. PHP" />
              </FormRow>
              <FormRow label="Est. Close Date" error={errors.estCloseDate?.message}>
                <DateInput {...register('estCloseDate')} />
              </FormRow>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Description</h2>
            <TextareaWithCounter {...register('description')} rows={4} maxLength={2000} placeholder="Notes about this opportunity…" />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button type="button" variant="outline" onClick={cancelEdit} disabled={isPending}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      <EntityTagsSection entityType="PharmaOpportunity" entityId={id ?? ''} />
          <EntityNotesSection entityType="PharmaOpportunity" entityId={id ?? ''} />
      <EntityHistorySection entityType="PharmaOpportunity" entityId={id ?? ''} />

      {/* Stage advance confirmation */}
      <ConfirmDialog
        open={!!stageTarget}
        onCancel={() => setStageTarget(null)}
        onConfirm={handleAdvanceStage}
        title={`Advance to ${formatLabel(stageTarget ?? '')}?`}
        description={`This will move the opportunity to "${formatLabel(stageTarget ?? '')}" stage. This change is permanent.`}
        confirmLabel="Advance Stage"
        isPending={isAdvancing}
      />
    </div>
  )
}
