import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Plus, Trash2 } from 'lucide-react'
import { useContactAffiliations, useAddAffiliation, useRemoveAffiliation } from '@/api/endpoints/contacts'
import { useAccountSearch } from '@/api/endpoints/accounts'
import { useRole } from '@/hooks/useRole'
import { useDebounce } from '@/hooks/useDebounce'
import { affiliationSchema, type AffiliationFormData } from '@/schemas/contacts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FormRow } from '@/components/shared/FormRow'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatDate } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import type { PharmaContactAffiliation } from '@/api/app-types'

interface ContactAffiliationsSectionProps {
  contactId: string
}

function AffiliationRow({
  affiliation,
  contactId,
  canEdit,
}: {
  affiliation: PharmaContactAffiliation
  contactId: string
  canEdit: boolean
}) {
  const [showRemove, setShowRemove] = useState(false)
  const { mutate: removeAffiliation, isPending } = useRemoveAffiliation(contactId)

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {affiliation.accountName ?? '—'}
          </p>
          {affiliation.isPrimaryAffiliation && (
            <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary shrink-0">
              Primary
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {affiliation.positionTitle && <span>{affiliation.positionTitle}</span>}
          {affiliation.department && <span>· {affiliation.department}</span>}
          {affiliation.availableHours && <span>· {affiliation.availableHours}</span>}
          {affiliation.consultationFee != null && (
            <span>· Fee: {affiliation.consultationFee.toLocaleString()}</span>
          )}
          {affiliation.effectiveTo && <span>· Until {formatDate(affiliation.effectiveTo)}</span>}
        </div>
        {affiliation.notes && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{affiliation.notes}</p>
        )}
      </div>

      {canEdit && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
            onClick={() => setShowRemove(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <ConfirmDialog
            open={showRemove}
            onCancel={() => setShowRemove(false)}
            onConfirm={() =>
              removeAffiliation(affiliation.id!, {
                onSuccess: () => {
                  toast('Affiliation removed', { variant: 'success' })
                  setShowRemove(false)
                },
                onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
              })
            }
            title="Remove Affiliation?"
            description={`Remove the affiliation with "${affiliation.accountName}"? This cannot be undone.`}
            confirmLabel="Remove"
            isPending={isPending}
          />
        </>
      )}
    </div>
  )
}

function AddAffiliationDialog({
  contactId,
  onClose,
}: {
  contactId: string
  onClose: () => void
}) {
  const [accountQuery, setAccountQuery] = useState('')
  const debouncedAccountQuery = useDebounce(accountQuery, 300)
  const { data: accountResults, isLoading: isSearchingAccounts } = useAccountSearch(debouncedAccountQuery)

  const accountOptions: ComboboxOption[] = (accountResults ?? []).map((a) => ({
    value: a.id!,
    label: a.name ?? '',
  }))

  const { mutate: addAffiliation, isPending } = useAddAffiliation(contactId)

  const { register, handleSubmit, control, formState: { errors } } = useForm<AffiliationFormData>({
    resolver: zodResolver(affiliationSchema),
    defaultValues: { isPrimary: false },
  })

  function onSubmit(data: AffiliationFormData) {
    addAffiliation(data, {
      onSuccess: () => {
        toast('Affiliation added', { variant: 'success' })
        onClose()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Hospital Affiliation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
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

          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Position / Title" error={errors.positionTitle?.message}>
              <Input {...register('positionTitle')} placeholder="e.g. Consultant" />
            </FormRow>
            <FormRow label="Department" error={errors.department?.message}>
              <Input {...register('department')} placeholder="e.g. Cardiology" />
            </FormRow>
            <FormRow label="Available Hours" error={errors.availableHours?.message}>
              <Input {...register('availableHours')} placeholder="e.g. Mon-Fri 8am–5pm" />
            </FormRow>
            <FormRow label="Consultation Fee" error={errors.consultationFee?.message}>
              <Input {...register('consultationFee')} type="number" min={0} step={0.01} placeholder="0.00" />
            </FormRow>
            <FormRow label="Effective Until" error={errors.effectiveTo?.message}>
              <Input {...register('effectiveTo')} type="date" />
            </FormRow>
          </div>

          <FormRow label="Notes" error={errors.notes?.message}>
            <Textarea {...register('notes')} rows={2} placeholder="Any notes about this affiliation…" />
          </FormRow>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              {...register('isPrimary')}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            <Label htmlFor="isPrimary" className="text-sm text-foreground cursor-pointer">
              Set as primary affiliation
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding…' : 'Add Affiliation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ContactAffiliationsSection({ contactId }: ContactAffiliationsSectionProps) {
  const [showAdd, setShowAdd] = useState(false)
  const { data: affiliations, isLoading } = useContactAffiliations(contactId)
  const { isManager } = useRole()

  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Hospital Affiliations
        </h2>
        {isManager && (
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !affiliations?.length ? (
        <p className="text-sm text-muted-foreground">No affiliations recorded.</p>
      ) : (
        <div className="space-y-2">
          {affiliations.map((a) => (
            <AffiliationRow
              key={a.id}
              affiliation={a}
              contactId={contactId}
              canEdit={isManager}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddAffiliationDialog
          contactId={contactId}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
