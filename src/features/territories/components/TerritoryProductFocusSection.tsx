import { useState } from 'react'
import { PackagePlus, Trash2, Package } from 'lucide-react'
import { useTerritoryProductFocus, useAddProductFocus, useRemoveProductFocus } from '@/api/endpoints/territories'
import { useProductSearch } from '@/api/endpoints/products'
import { useRole } from '@/hooks/useRole'
import { useDebounce } from '@/hooks/useDebounce'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormRow } from '@/components/shared/FormRow'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { formatDate } from '@/utils/formatters'
import type { ProductFocusInfo } from '@/api/app-types'

interface TerritoryProductFocusSectionProps {
  territoryId: string
}

export function TerritoryProductFocusSection({ territoryId }: TerritoryProductFocusSectionProps) {
  const { isManager } = useRole()
  const { data: items, isLoading } = useTerritoryProductFocus(territoryId)
  const { mutate: addProduct, isPending: isAdding } = useAddProductFocus(territoryId)
  const { mutate: removeProduct, isPending: isRemoving } = useRemoveProductFocus(territoryId)

  const [showAdd, setShowAdd] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [priority, setPriority] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [itemToRemove, setItemToRemove] = useState<ProductFocusInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)

  const { data: productResults, isLoading: isSearching } = useProductSearch(debouncedQuery)
  const productOptions: ComboboxOption[] = (productResults ?? []).map((p) => ({
    value: p.id!,
    label: p.name ?? p.id ?? '',
  }))

  function handleAdd() {
    if (!selectedProductId) return
    addProduct(
      {
        productId: selectedProductId,
        priority: priority ? Number(priority) : undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast('Product added to focus', { variant: 'success' })
          setShowAdd(false)
          setSelectedProductId('')
          setPriority('')
          setNotes('')
          setSearchQuery('')
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      }
    )
  }

  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Package className="h-3.5 w-3.5" strokeWidth={1.75} />
          Product Focus
        </h2>
        {isManager && !showAdd && (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <PackagePlus className="h-3.5 w-3.5 mr-1.5" />
            Add Product
          </Button>
        )}
      </div>

      {showAdd && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          <FormRow label="Product">
            <Combobox
              value={selectedProductId}
              onChange={setSelectedProductId}
              options={productOptions}
              placeholder="Search products…"
              searchPlaceholder="Type product name…"
              onSearchChange={setSearchQuery}
              isLoading={isSearching}
            />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Priority (optional)" fieldId="focus-priority">
              <Input
                id="focus-priority"
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />
            </FormRow>
            <FormRow label="Notes (optional)" fieldId="focus-notes">
              <Input
                id="focus-notes"
                placeholder="e.g. Key brand focus"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </FormRow>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!selectedProductId || isAdding}>
              {isAdding ? 'Adding…' : 'Add'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setShowAdd(false); setSelectedProductId(''); setPriority(''); setNotes(''); setSearchQuery('') }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : !items || items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No product focus items added.</p>
      ) : (
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.productId} className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{item.productName ?? '—'}</p>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {item.priority != null && <span>Priority {item.priority}</span>}
                  {item.notes && <span>{item.notes}</span>}
                  {item.assignedAt && <span>Added {formatDate(item.assignedAt)}</span>}
                </div>
              </div>
              {isManager && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setItemToRemove(item)}
                  disabled={isRemoving}
                  aria-label={`Remove ${item.productName}`}
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
          removeProduct(itemToRemove!.productId!, {
            onSuccess: () => {
              toast('Product removed from focus', { variant: 'success' })
              setItemToRemove(null)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setItemToRemove(null)
            },
          })
        }
        title="Remove Product?"
        description={`Remove ${itemToRemove?.productName ?? 'this product'} from territory focus?`}
        confirmLabel="Remove"
        isPending={isRemoving}
      />
    </div>
  )
}
