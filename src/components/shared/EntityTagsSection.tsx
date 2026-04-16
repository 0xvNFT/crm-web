/**
 * EntityTagsSection — reusable polymorphic tags panel for any entity detail page.
 *
 * Industry-standard CRM tagging: colored chips, inline apply/remove.
 * MANAGER/ADMIN — apply existing tags OR create new tags inline (combobox).
 * FIELD_REP — select from existing tags only (dropdown).
 * READ_ONLY — view only, no apply/remove.
 *
 * Usage:
 *   <EntityTagsSection entityType="PharmaAccount" entityId={account.id ?? ''} />
 *
 * entityType must match the backend Java class name exactly (e.g. "PharmaAccount").
 */
import { useState, useMemo, useEffect, useRef } from 'react'
import { Tag, X, Plus, Check, Loader2 } from 'lucide-react'
import { useEntityTags, useApplyTags, useRemoveTag, useAllTags, useCreateTag } from '@/api/endpoints/tags'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PharmaTag } from '@/api/app-types'

// ─── Allowed entity types ─────────────────────────────────────────────────────
export type TagEntityType =
  | 'PharmaAccount'
  | 'PharmaContact'
  | 'PharmaLead'
  | 'PharmaOpportunity'
  | 'PharmaOrder'
  | 'PharmaQuote'
  | 'PharmaInvoice'
  | 'PharmaFieldVisit'
  | 'PharmaProduct'

// ─── Tag chip ─────────────────────────────────────────────────────────────────
interface TagChipProps {
  tag: PharmaTag
  onRemove?: () => void
  isRemoving?: boolean
}

function TagChip({ tag, onRemove, isRemoving }: TagChipProps) {
  // Darken the hex color for text contrast
  const bgColor = tag.color ?? '#6366f1'
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
      style={{
        backgroundColor: bgColor + '20', // 12% opacity background
        borderColor:     bgColor + '50', // 31% opacity border
        color:           bgColor,
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove tag ${tag.name}`}
          className="ml-0.5 rounded-full hover:opacity-70 transition-opacity disabled:opacity-40"
          onClick={onRemove}
          disabled={isRemoving}
        >
          {isRemoving
            ? <Loader2 className="h-3 w-3 animate-spin" strokeWidth={1.5} />
            : <X className="h-3 w-3" strokeWidth={1.5} />
          }
        </button>
      )}
    </span>
  )
}

// ─── Tag picker — applies existing tags or creates new inline (MANAGER/ADMIN) ──
interface TagPickerProps {
  entityType: TagEntityType
  entityId: string
  appliedTagIds: Set<string>
  canCreate: boolean  // MANAGER/ADMIN only
  onClose: () => void
}

// Preset palette — cycled when auto-assigning color to new inline tags
const COLOR_PALETTE = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
]

function TagPicker({ entityType, entityId, appliedTagIds, canCreate, onClose }: TagPickerProps) {
  const [search, setSearch]     = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName]   = useState('')
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0])
  const containerRef            = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  const { data: allTags = [], isLoading: loadingTags } = useAllTags()
  const { mutate: applyTags, isPending: isApplying }   = useApplyTags(entityType, entityId)
  const { mutate: createTag, isPending: isCreating }   = useCreateTag()

  const filtered = allTags.filter(
    (t) =>
      !appliedTagIds.has(t.id ?? '') &&
      t.name?.toLowerCase().includes(search.toLowerCase()),
  )

  const exactMatch = allTags.find(
    (t) => t.name?.toLowerCase() === search.toLowerCase(),
  )

  function applyTag(tagId: string) {
    applyTags(
      { tagIds: [tagId] },
      {
        onSuccess: () => toast('Tag applied', { variant: 'success' }),
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      },
    )
  }

  function handleCreateAndApply() {
    if (!newName.trim()) return
    createTag(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: (tag) => {
          applyTags(
            { tagIds: [tag.id!] }, // Why: tag was just created by the backend — id is always present in the response
            {
              onSuccess: () => {
                toast(`Tag "${tag.name}" created and applied`, { variant: 'success' })
                setCreating(false)
                setNewName('')
                onClose()
              },
              onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
            },
          )
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      },
    )
  }

  return (
    <div ref={containerRef} className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border bg-popover shadow-lg">
      {/* Search */}
      <div className="p-2 border-b">
        <Input
          autoFocus
          placeholder="Search or create tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs"
        />
      </div>

      {/* Tag list */}
      <div className="max-h-48 overflow-y-auto py-1">
        {loadingTags ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted text-left transition-colors"
              onClick={() => applyTag(tag.id!)}
              disabled={isApplying}
            >
              <span
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: tag.color ?? '#6366f1' }}
              />
              {tag.name}
            </button>
          ))
        ) : !canCreate || exactMatch ? (
          <p className="px-3 py-3 text-xs text-muted-foreground text-center">
            {exactMatch ? 'Already applied or no match' : 'No tags found'}
          </p>
        ) : null}

        {/* Create new — shown when no exact match and canCreate */}
        {canCreate && search.trim() && !exactMatch && !creating && (
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-primary hover:bg-muted text-left transition-colors border-t mt-1"
            onClick={() => {
              setNewName(search.trim())
              setNewColor(COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)])
              setCreating(true)
            }}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Create "{search.trim()}"
          </button>
        )}
      </div>

      {/* Inline create form */}
      {creating && (
        <div className="border-t p-3 space-y-2">
          <p className="text-xs font-medium">New tag</p>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tag name"
            className="h-7 text-xs"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Color:</span>
            <div className="flex gap-1 flex-wrap">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Select color ${c}`}
                  className="h-5 w-5 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: newColor === c ? '#000' : 'transparent',
                  }}
                  onClick={() => setNewColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-6 text-xs"
              onClick={handleCreateAndApply}
              disabled={isCreating || isApplying || !newName.trim()}
            >
              <Check className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
              {isCreating || isApplying ? 'Saving…' : 'Create & Apply'}
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t px-3 py-2 flex justify-end">
        <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
interface EntityTagsSectionProps {
  entityType: TagEntityType
  entityId: string
}

export function EntityTagsSection({ entityType, entityId }: EntityTagsSectionProps) {
  const [pickerOpen, setPickerOpen]         = useState(false)
  const [removingTagId, setRemovingTagId]   = useState<string | null>(null)
  const [confirmTag, setConfirmTag]         = useState<PharmaTag | null>(null)

  const { isManager, isReadOnly } = useRole()

  const { data: tags = [], isLoading } = useEntityTags(entityType, entityId)
  const { mutate: removeTag, isPending: isRemoving } = useRemoveTag(entityType, entityId)

  const appliedTagIds = useMemo(() => new Set(tags.map((t) => t.id ?? '')), [tags])

  function handleRemove(tag: PharmaTag) {
    setConfirmTag(tag)
  }

  function confirmRemove() {
    if (!confirmTag?.id) return
    setRemovingTagId(confirmTag.id)
    removeTag(confirmTag.id, {
      onSuccess: () => {
        toast('Tag removed', { variant: 'success' })
        setConfirmTag(null)
        setRemovingTagId(null)
      },
      onError: (err) => {
        toast(parseApiError(err), { variant: 'destructive' })
        setConfirmTag(null)
        setRemovingTagId(null)
      },
    })
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card">
      {/* Header */}
      <div className="px-5 py-3 border-b bg-muted/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tags
            {tags.length > 0 && (
              <span className="ml-1.5 font-normal text-muted-foreground/70">({tags.length})</span>
            )}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex justify-center py-2">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {/* Applied tags */}
            {tags.map((tag) => (
              <TagChip
                key={tag.id}
                tag={tag}
                onRemove={isManager ? () => handleRemove(tag) : undefined}
                isRemoving={isRemoving && removingTagId === tag.id}
              />
            ))}

            {/* Add tag button + picker */}
            {!isReadOnly && (
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs gap-1 rounded-full"
                  onClick={() => setPickerOpen((v) => !v)}
                >
                  <Plus className="h-3 w-3" strokeWidth={1.5} />
                  Add Tag
                </Button>

                {pickerOpen && (
                  <TagPicker
                    entityType={entityType}
                    entityId={entityId}
                    appliedTagIds={appliedTagIds}
                    canCreate={isManager}
                    onClose={() => setPickerOpen(false)}
                  />
                )}
              </div>
            )}

            {tags.length === 0 && (
              <p className="text-xs text-muted-foreground">No tags</p>
            )}
          </div>
        )}
      </div>

      {/* Remove confirmation */}
      <ConfirmDialog
        open={confirmTag !== null}
        onCancel={() => setConfirmTag(null)}
        onConfirm={confirmRemove}
        title="Remove Tag?"
        description={`Remove "${confirmTag?.name}" from this record?`}
        confirmLabel="Remove"
        isPending={isRemoving}
      />
    </div>
  )
}
