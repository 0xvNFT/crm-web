import { useState } from 'react'
import { Pill, PillIcon, Trash2 } from 'lucide-react'
import { useVisitProducts, useAddVisitProduct, useRemoveVisitProduct } from '@/api/endpoints/visits'
import { useProductSearch } from '@/api/endpoints/products'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormRow } from '@/components/shared/FormRow'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { VisitProductInfo, PharmaFieldVisit } from '@/api/app-types'

interface VisitProductsSectionProps {
  visitId: string
  visit: PharmaFieldVisit
}

export function VisitProductsSection({ visitId, visit }: VisitProductsSectionProps) {
  const { isManager } = useRole()
  const { user } = useAuth()
  const isOwnVisit = visit.assignedRepId === user?.userId
  const canManage = isOwnVisit || isManager

  const { data: products, isLoading } = useVisitProducts(visitId)
  const { mutate: addProduct, isPending: isAdding } = useAddVisitProduct(visitId)
  const { mutate: removeProduct, isPending: isRemoving } = useRemoveVisitProduct(visitId)

  const [showAdd, setShowAdd] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [itemToRemove, setItemToRemove] = useState<VisitProductInfo | null>(null)
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
      { productId: selectedProductId, notes: notes || undefined },
      {
        onSuccess: () => {
          toast('Product added to visit', { variant: 'success' })
          setShowAdd(false)
          setSelectedProductId('')
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
          <Pill className="h-3.5 w-3.5" strokeWidth={1.75} />
          Products Discussed
        </h2>
        {canManage && !showAdd && (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <PillIcon className="h-3.5 w-3.5 mr-1.5" />
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
          <FormRow label="Notes (optional)" fieldId="vp-notes">
            <Input
              id="vp-notes"
              placeholder="Discussion notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormRow>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!selectedProductId || isAdding}>
              {isAdding ? 'Adding…' : 'Add'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setShowAdd(false); setSelectedProductId(''); setNotes(''); setSearchQuery('') }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : !products || products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products recorded for this visit.</p>
      ) : (
        <ul className="divide-y">
          {products.map((item) => (
            <li key={item.productId} className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{item.productName ?? '—'}</p>
                {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
              </div>
              {canManage && (
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
              toast('Product removed from visit', { variant: 'success' })
              setItemToRemove(null)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setItemToRemove(null)
            },
          })
        }
        title="Remove Product?"
        description={`Remove ${itemToRemove?.productName ?? 'this product'} from this visit?`}
        confirmLabel="Remove"
        isPending={isRemoving}
      />
    </div>
  )
}
