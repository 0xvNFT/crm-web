import { useState } from 'react'
import { Plus, Trash2, Users, CheckCircle2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useCampaignContacts,
  useAddCampaignContact,
  useUpdateCampaignContact,
  useRemoveCampaignContact,
} from '@/api/endpoints/campaigns'
import { useContactSearch } from '@/api/endpoints/contacts'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/hooks/useRole'
import { usePagination } from '@/hooks/usePagination'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { Button } from '@/components/ui/button'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormRow } from '@/components/shared/FormRow'
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { addCampaignContactSchema, type AddCampaignContactFormData } from '@/schemas/campaigns'
import type { CampaignContact, PharmaContact } from '@/api/app-types'

// ─── Add contact form ─────────────────────────────────────────────────────────

function AddContactForm({
  campaignId,
  onDone,
}: {
  campaignId: string
  onDone: () => void
}) {
  const [contactQuery, setContactQuery] = useState('')
  const [cachedContacts, setCachedContacts] = useState<PharmaContact[]>([])

  const debouncedQuery = useDebounce(contactQuery, 300)
  const { data: searchResults, isLoading: isSearching } = useContactSearch(debouncedQuery)

  const mergedContacts = [
    ...cachedContacts,
    ...(searchResults ?? []).filter((c) => !cachedContacts.find((x) => x.id === c.id)),
  ]
  const contactOptions: ComboboxOption[] = mergedContacts
    .filter((c) => c.id && c.firstName)
    .map((c) => ({
      value: c.id!,
      label: [c.firstName, c.lastName].filter(Boolean).join(' '),
      sublabel: c.specialty ?? c.accountName ?? undefined,
    }))

  const { mutate: addContact, isPending } = useAddCampaignContact(campaignId)

  const { register, handleSubmit, control, formState: { errors } } =
    useForm<AddCampaignContactFormData>({
      resolver: zodResolver(addCampaignContactSchema),
    })

  function handleContactChange(id: string) {
    if (searchResults) {
      setCachedContacts((prev) => [
        ...prev,
        ...(searchResults).filter((c) => !prev.find((x) => x.id === c.id)),
      ])
    }
    return id
  }

  function onSubmit(data: AddCampaignContactFormData) {
    addContact(
      { contactId: data.contactId, notes: data.notes || undefined },
      {
        onSuccess: () => {
          toast('Contact added to campaign', { variant: 'success' })
          onDone()
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border border-border/60 rounded-lg p-4 bg-muted/30 space-y-3"
    >
      <h3 className="text-sm font-semibold">Add Contact</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormRow label="Contact *" fieldId="contactId" error={errors.contactId?.message}>
          <Controller
            name="contactId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ?? ''}
                onChange={(v) => { field.onChange(v); handleContactChange(v) }}
                options={contactOptions}
                placeholder="Search contacts…"
                searchPlaceholder="Type a name or specialty…"
                onSearchChange={setContactQuery}
                isLoading={isSearching}
                error={!!errors.contactId}
              />
            )}
          />
        </FormRow>
        <FormRow label="Notes" fieldId="notes">
          <TextareaWithCounter
            id="notes"
            {...register('notes')}
            maxLength={2000}
            rows={2}
            placeholder="Optional notes…"
          />
        </FormRow>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Adding…' : 'Add Contact'}
        </Button>
      </div>
    </form>
  )
}

// ─── Inline status update row ─────────────────────────────────────────────────

function ContactStatusRow({
  campaignId,
  entry,
  onDone,
}: {
  campaignId: string
  entry: CampaignContact
  onDone: () => void
}) {
  const { mutate: updateContact, isPending } = useUpdateCampaignContact(
    campaignId,
    entry.id ?? '',
  )
  const contactStatusOptions = useConfigOptions('campaign.contactStatus')

  const [status, setStatus] = useState<string>(entry.status ?? 'targeted')

  function handleSave() {
    updateContact(
      { status },
      {
        onSuccess: () => {
          toast('Contact status updated', { variant: 'success' })
          onDone()
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      },
    )
  }

  return (
    <div className="border border-primary/30 rounded-lg p-3 bg-primary/5 flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium">{entry.contactName}</p>
        <p className="text-xs text-muted-foreground">{entry.contactSpecialty ?? '—'}</p>
      </div>
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {contactStatusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

interface CampaignContactsSectionProps {
  campaignId: string
  isActive: boolean
}

export function CampaignContactsSection({ campaignId, isActive }: CampaignContactsSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useCampaignContacts(campaignId, page, 20)
  const { mutate: removeContact } = useRemoveCampaignContact(campaignId)
  const { isManager } = useRole()

  const [showAddForm, setShowAddForm]   = useState(false)
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [removingEntry, setRemovingEntry] = useState<CampaignContact | null>(null)

  const entries = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  // Only ADMIN/MANAGER can mutate contacts — matches backend @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
  const canEdit = isActive && isManager

  function handleRemove() {
    if (!removingEntry?.id) return
    removeContact(removingEntry.id, {
      onSuccess: () => {
        toast('Contact removed from campaign', { variant: 'success' })
        setRemovingEntry(null)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-foreground">Contacts</h2>
          {data?.totalElements != null && data.totalElements > 0 && (
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {data.totalElements}
            </span>
          )}
        </div>
        {canEdit && !showAddForm && (
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
            Add Contact
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddContactForm campaignId={campaignId} onDone={() => setShowAddForm(false)} />
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : entries.length === 0 && !showAddForm ? (
        <p className="text-sm text-muted-foreground">
          No contacts targeted yet.{' '}
          {canEdit ? 'Add contacts to begin tracking engagement.' : ''}
        </p>
      ) : (
        <div className="space-y-2">
          {entries.length > 0 && (
            <div className="grid grid-cols-12 gap-2 px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <div className="col-span-4">Contact</div>
              <div className="col-span-3">Account</div>
              <div className="col-span-2">Specialty</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1" />
            </div>
          )}

          {entries.map((entry) =>
            editingId === entry.id ? (
              <ContactStatusRow
                key={entry.id}
                campaignId={campaignId}
                entry={entry}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <div
                key={entry.id}
                className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                <div className="col-span-4">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.contactName ?? '—'}
                  </p>
                  {entry.contactType && (
                    <p className="text-xs text-muted-foreground">{entry.contactType}</p>
                  )}
                </div>
                <div className="col-span-3 text-sm text-muted-foreground truncate">
                  {entry.accountName ?? '—'}
                </div>
                <div className="col-span-2 text-sm text-muted-foreground truncate">
                  {entry.contactSpecialty ?? '—'}
                </div>
                <div className="col-span-2">
                  <StatusBadge status={entry.status ?? 'unknown'} />
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  {canEdit && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingId(entry.id ?? null)}
                        aria-label="Update status"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setRemovingEntry(entry)}
                        aria-label="Remove contact"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ),
          )}

          {totalPages > 1 && (
            <div className="border-t border-border/40 pt-3">
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!removingEntry}
        onCancel={() => setRemovingEntry(null)}
        onConfirm={handleRemove}
        title="Remove Contact?"
        description={`Remove "${removingEntry?.contactName}" from this campaign?`}
        confirmLabel="Remove"
      />
    </div>
  )
}
