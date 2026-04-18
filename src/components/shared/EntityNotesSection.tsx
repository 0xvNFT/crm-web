/**
 * EntityNotesSection — reusable polymorphic notes panel for any entity detail page.
 *
 * Industry-standard CRM notes: pinned first, inline add/edit/delete, note type chips.
 * MANAGER/ADMIN can pin notes and edit/delete any note.
 * FIELD_REP can add notes and edit/delete only their own.
 *
 * Usage:
 *   <EntityNotesSection entityType="PharmaAccount" entityId={account.id ?? ''} />
 *
 * entityType must match the backend Java class name exactly (same convention as audit).
 */
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { StickyNote, Pin, PinOff, Pencil, Trash2, Plus, X, Check } from 'lucide-react'
import { useNotesByEntity, useCreateNote, useUpdateNote, useDeleteNote, useToggleNotePin } from '@/api/endpoints/notes'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/hooks/useAuth'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { FormRow } from '@/components/shared/FormRow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { formatDateTime, formatLabel } from '@/utils/formatters'
import { createNoteSchema, updateNoteSchema } from '@/schemas/notes'
import type { CreateNoteFormValues, UpdateNoteFormValues } from '@/schemas/notes'
import type { PharmaNote } from '@/api/app-types'

// ─── Allowed entity types — keep in sync with backend PharmaNotesService ──────
export type NoteEntityType =
  | 'PharmaAccount'
  | 'PharmaContact'
  | 'PharmaLead'
  | 'PharmaOpportunity'
  | 'PharmaOrder'
  | 'PharmaQuote'
  | 'PharmaInvoice'
  | 'PharmaFieldVisit'
  | 'PharmaProduct'
  | 'PharmaCampaign'

// ─── Note type chip ───────────────────────────────────────────────────────────
// NOTE: colours are static by design — config drives the type values but not their visual weight.
// If the backend adds a new note type, add a matching entry here; unknown types fall back to 'general'.
const NOTE_TYPE_COLORS: Record<string, string> = {
  call_summary: 'bg-blue-50 text-blue-700 border-blue-200',
  meeting:      'bg-purple-50 text-purple-700 border-purple-200',
  follow_up:    'bg-amber-50 text-amber-700 border-amber-200',
  concern:      'bg-red-50 text-red-700 border-red-200',
  general:      'bg-muted text-muted-foreground border-border',
}

function NoteTypeChip({ type }: { type: string }) {
  const color = NOTE_TYPE_COLORS[type] ?? NOTE_TYPE_COLORS.general
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}>
      {formatLabel(type)}
    </span>
  )
}

// ─── Add note form ────────────────────────────────────────────────────────────
interface AddNoteFormProps {
  entityType: string
  entityId: string
  onDone: () => void
}

function AddNoteForm({ entityType, entityId, onDone }: AddNoteFormProps) {
  const noteTypeOptions = useConfigOptions('note.type')
  const { mutate: createNote, isPending } = useCreateNote(entityType, entityId)

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateNoteFormValues>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: { noteType: 'general' },
  })

  function onSubmit(values: CreateNoteFormValues) {
    createNote(
      { entityType, entityId, ...values },
      {
        onSuccess: () => {
          toast('Note added', { variant: 'success' })
          onDone()
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex gap-3">
        {/* Title (optional) */}
        <div className="flex-1">
          <FormRow label="Subject (optional)" fieldId="note-title">
            <Input id="note-title" placeholder="Optional subject line…" {...register('title')} />
          </FormRow>
        </div>
        {/* Note type */}
        <div className="w-44 shrink-0">
          <FormRow label="Type">
            <Controller
              name="noteType"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {noteTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
        </div>
      </div>

      <FormRow label="Note" required fieldId="note-body" error={errors.body?.message}>
        <TextareaWithCounter
          id="note-body"
          placeholder="Write your note here…"
          rows={3}
          maxLength={2000}
          {...register('body')}
        />
      </FormRow>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={isPending}>
          <X className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          <Check className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
          {isPending ? 'Saving…' : 'Add Note'}
        </Button>
      </div>
    </form>
  )
}

// ─── Edit note form ───────────────────────────────────────────────────────────
interface EditNoteFormProps {
  note: PharmaNote
  entityType: string
  entityId: string
  onDone: () => void
}

function EditNoteForm({ note, entityType, entityId, onDone }: EditNoteFormProps) {
  const noteTypeOptions = useConfigOptions('note.type')
  const { mutate: updateNote, isPending } = useUpdateNote(entityType, entityId)

  const { register, handleSubmit, control, formState: { errors } } = useForm<UpdateNoteFormValues>({
    resolver: zodResolver(updateNoteSchema),
    defaultValues: {
      title:    note.title ?? undefined,
      body:     note.body ?? '',
      noteType: note.noteType ?? 'general',
    },
  })

  function onSubmit(values: UpdateNoteFormValues) {
    // Strip empty strings before sending — backend rejects ""
    const payload = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v !== '' && v !== undefined),
    ) as UpdateNoteFormValues

    updateNote(
      { id: note.id!, data: payload },
      {
        onSuccess: () => {
          toast('Note updated', { variant: 'success' })
          onDone()
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border bg-muted/30 p-4 mt-2">
      <div className="flex gap-3">
        <div className="flex-1">
          <FormRow label="Subject (optional)" fieldId={`edit-title-${note.id}`}>
            <Input id={`edit-title-${note.id}`} placeholder="Optional subject line…" {...register('title')} />
          </FormRow>
        </div>
        <div className="w-44 shrink-0">
          <FormRow label="Type">
            <Controller
              name="noteType"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {noteTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
        </div>
      </div>

      <FormRow label="Note" required fieldId={`edit-body-${note.id}`} error={errors.body?.message}>
        <TextareaWithCounter
          id={`edit-body-${note.id}`}
          rows={3}
          maxLength={2000}
          {...register('body')}
        />
      </FormRow>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={isPending}>
          <X className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          <Check className="h-4 w-4 mr-1.5" strokeWidth={1.5} />
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ─── Individual note row ──────────────────────────────────────────────────────
interface NoteRowProps {
  note: PharmaNote
  entityType: string
  entityId: string
  currentUserId: string | undefined
  canManageAny: boolean  // MANAGER or ADMIN
}

function NoteRow({ note, entityType, entityId, currentUserId, canManageAny }: NoteRowProps) {
  const [editing, setEditing] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const { mutate: deleteNote, isPending: isDeleting } = useDeleteNote(entityType, entityId)
  const { mutate: togglePin,  isPending: isPinning }  = useToggleNotePin(entityType, entityId)

  const isOwner    = !!currentUserId && note.createdById === currentUserId
  const canEdit    = canManageAny || isOwner
  const canDelete  = canManageAny || isOwner
  const canPin     = canManageAny

  return (
    <div className={`px-5 py-4 hover:bg-muted/20 transition-colors ${note.isPinned ? 'border-l-2 border-l-primary/50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Header row: type chip + pinned badge + title */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {note.noteType && <NoteTypeChip type={note.noteType} />}
            {note.isPinned && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs font-medium">
                <Pin className="h-3 w-3" strokeWidth={1.5} />
                Pinned
              </span>
            )}
            {note.title && (
              <span className="text-sm font-semibold text-foreground">{note.title}</span>
            )}
          </div>

          {/* Body */}
          {!editing && (
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{note.body}</p>
          )}

          {/* Meta: author + timestamp + updatedBy */}
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span>{note.createdByName ?? '—'}</span>
            <span>·</span>
            <span>{note.createdAt ? formatDateTime(note.createdAt) : '—'}</span>
            {note.updatedByName && note.updatedByName !== note.createdByName && (
              <>
                <span>·</span>
                <span>Edited by {note.updatedByName}</span>
              </>
            )}
          </div>

          {/* Inline edit form */}
          {editing && (
            <EditNoteForm
              note={note}
              entityType={entityType}
              entityId={entityId}
              onDone={() => setEditing(false)}
            />
          )}
        </div>

        {/* Action buttons */}
        {!editing && (
          <div className="flex items-center gap-1 shrink-0">
            {canPin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
                onClick={() =>
                  togglePin(note.id!, {
                    onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
                  })
                }
                disabled={isPinning}
              >
                {note.isPinned
                  ? <PinOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                  : <Pin    className="h-3.5 w-3.5" strokeWidth={1.5} />
                }
              </Button>
            )}
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Edit note"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                aria-label="Delete note"
                onClick={() => setShowDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={() =>
          deleteNote(note.id!, {
            onSuccess: () => {
              toast('Note deleted', { variant: 'success' })
              setShowDelete(false)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setShowDelete(false)
            },
          })
        }
        title="Delete Note?"
        description="This will permanently delete this note. This cannot be undone."
        confirmLabel="Delete"
        isPending={isDeleting}
      />
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface EntityNotesSectionProps {
  entityType: NoteEntityType
  entityId: string
}

export function EntityNotesSection({ entityType, entityId }: EntityNotesSectionProps) {
  const [adding, setAdding] = useState(false)
  const { page, goToPage } = usePagination()
  const { user } = useAuth()
  const { isManager, isReadOnly } = useRole()

  const { data, isLoading } = useNotesByEntity(entityType, entityId, page, 10)

  const notes      = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Notes
            {data?.totalElements ? (
              <span className="ml-1.5 font-normal text-muted-foreground/70">({data.totalElements})</span>
            ) : null}
          </h2>
        </div>
        {!isReadOnly && !adding && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setAdding(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
            Add Note
          </Button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <div className="px-5 py-4 border-b">
          <AddNoteForm entityType={entityType} entityId={entityId} onDone={() => setAdding(false)} />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="px-5 py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : notes.length === 0 ? (
        <div className="px-5 py-8">
          <EmptyState
            icon={StickyNote}
            title="No notes yet"
            description="Add a note to keep track of important details about this record."
          />
        </div>
      ) : (
        <>
          <div className="divide-y">
            {notes.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                entityType={entityType}
                entityId={entityId}
                currentUserId={user?.userId}
                canManageAny={isManager}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t">
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
