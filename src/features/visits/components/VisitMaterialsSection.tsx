import { useState } from 'react'
import { BookOpen, BookPlus, Trash2 } from 'lucide-react'
import { useVisitMaterials, useAddVisitMaterial, useRemoveVisitMaterial } from '@/api/endpoints/visits'
import { useMaterialSearch } from '@/api/endpoints/materials'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormRow } from '@/components/shared/FormRow'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { VisitMaterialInfo, PharmaFieldVisit } from '@/api/app-types'

interface VisitMaterialsSectionProps {
  visitId: string
  visit: PharmaFieldVisit
}

export function VisitMaterialsSection({ visitId, visit }: VisitMaterialsSectionProps) {
  const { isManager, isReadOnly } = useRole()
  const { user } = useAuth()
  const isOwnVisit = visit.assignedRepId === user?.userId
  const canManage = (isOwnVisit || isManager) && !isReadOnly

  const { data: materials, isLoading } = useVisitMaterials(visitId)
  const { mutate: addMaterial, isPending: isAdding } = useAddVisitMaterial(visitId)
  const { mutate: removeMaterial, isPending: isRemoving } = useRemoveVisitMaterial(visitId)

  const [showAdd, setShowAdd] = useState(false)
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [itemToRemove, setItemToRemove] = useState<VisitMaterialInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)

  const { data: materialResults, isLoading: isSearching } = useMaterialSearch(debouncedQuery)
  const materialOptions: ComboboxOption[] = (materialResults ?? []).map((m) => ({
    value: m.id!,
    label: m.title ?? m.id ?? '',
  }))

  function handleAdd() {
    if (!selectedMaterialId) return
    addMaterial(
      {
        materialId: selectedMaterialId,
        quantity: quantity ? Number(quantity) : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast('Material added to visit', { variant: 'success' })
          setShowAdd(false)
          setSelectedMaterialId('')
          setQuantity('')
          setNotes('')
          setSearchQuery('')
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      }
    )
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
          Materials Used
        </h2>
        {canManage && !showAdd && (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <BookPlus className="h-3.5 w-3.5 mr-1.5" />
            Add Material
          </Button>
        )}
      </div>

      {showAdd && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <FormRow label="Material">
            <Combobox
              value={selectedMaterialId}
              onChange={setSelectedMaterialId}
              options={materialOptions}
              placeholder="Search materials…"
              searchPlaceholder="Type material title…"
              onSearchChange={setSearchQuery}
              isLoading={isSearching}
            />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Quantity (optional)" fieldId="vm-qty">
              <Input
                id="vm-qty"
                type="number"
                min="1"
                placeholder="e.g. 2"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </FormRow>
            <FormRow label="Notes (optional)" fieldId="vm-notes">
              <Input
                id="vm-notes"
                placeholder="Optional notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormRow>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!selectedMaterialId || isAdding}>
              {isAdding ? 'Adding…' : 'Add'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setShowAdd(false); setSelectedMaterialId(''); setQuantity(''); setNotes(''); setSearchQuery('') }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : !materials || materials.length === 0 ? (
        <p className="text-sm text-muted-foreground">No materials recorded for this visit.</p>
      ) : (
        <ul className="divide-y">
          {materials.map((item) => (
            <li key={item.materialId} className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{item.materialName ?? '—'}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {item.quantity != null && <span>Qty: {item.quantity}</span>}
                  {item.notes && <span>{item.notes}</span>}
                </div>
              </div>
              {canManage && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setItemToRemove(item)}
                  disabled={isRemoving}
                  aria-label={`Remove ${item.materialName}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!itemToRemove}
        onCancel={() => setItemToRemove(null)}
        onConfirm={() =>
          removeMaterial(itemToRemove!.materialId!, {
            onSuccess: () => {
              toast('Material removed from visit', { variant: 'success' })
              setItemToRemove(null)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setItemToRemove(null)
            },
          })
        }
        title="Remove Material?"
        description={`Remove ${itemToRemove?.materialName ?? 'this material'} from this visit?`}
        confirmLabel="Remove"
        isPending={isRemoving}
      />
    </div>
  )
}
