import { useState } from 'react'
import { Plus, Trash2, Package, Star } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useCampaignProducts,
  useAddCampaignProduct,
  useRemoveCampaignProduct,
} from '@/api/endpoints/campaigns'
import { useProductSearch } from '@/api/endpoints/products'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormRow } from '@/components/shared/FormRow'
import { CheckboxField } from '@/components/shared/CheckboxField'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { addCampaignProductSchema, type AddCampaignProductFormData } from '@/schemas/campaigns'
import type { CampaignProduct, PharmaProduct } from '@/api/app-types'

// ─── Add product form ─────────────────────────────────────────────────────────

function AddProductForm({
  campaignId,
  onDone,
}: {
  campaignId: string
  onDone: () => void
}) {
  const [productQuery, setProductQuery] = useState('')
  const [cachedProducts, setCachedProducts] = useState<PharmaProduct[]>([])

  const debouncedQuery = useDebounce(productQuery, 300)
  const { data: searchResults, isLoading: isSearching } = useProductSearch(debouncedQuery)

  const mergedProducts = [
    ...cachedProducts,
    ...(searchResults ?? []).filter((p) => !cachedProducts.find((c) => c.id === p.id)),
  ]
  const productOptions: ComboboxOption[] = mergedProducts
    .filter((p) => p.id && p.name)
    .map((p) => ({
      value: p.id!,
      label: p.name!,
      sublabel: p.genericName ?? undefined,
    }))

  const { mutate: addProduct, isPending } = useAddCampaignProduct(campaignId)

  const { register, handleSubmit, control, formState: { errors } } =
    useForm<AddCampaignProductFormData>({
      resolver: zodResolver(addCampaignProductSchema),
      defaultValues: { isPrimary: false },
    })

  function handleProductChange(id: string) {
    if (searchResults) {
      setCachedProducts((prev) => [
        ...prev,
        ...(searchResults).filter((p) => !prev.find((c) => c.id === p.id)),
      ])
    }
    return id
  }

  function onSubmit(data: AddCampaignProductFormData) {
    addProduct(
      { productId: data.productId, isPrimary: data.isPrimary ?? false },
      {
        onSuccess: () => {
          toast('Product added to campaign', { variant: 'success' })
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
      <h3 className="text-sm font-semibold">Add Product</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormRow label="Product *" fieldId="productId" error={errors.productId?.message}>
          <Controller
            name="productId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ?? ''}
                onChange={(v) => { field.onChange(v); handleProductChange(v) }}
                options={productOptions}
                placeholder="Search products…"
                searchPlaceholder="Type a product name…"
                onSearchChange={setProductQuery}
                isLoading={isSearching}
                error={!!errors.productId}
              />
            )}
          />
        </FormRow>
        <FormRow label="" fieldId="isPrimary">
          <CheckboxField
            id="isPrimary"
            label="Primary product for this campaign"
            {...register('isPrimary')}
          />
        </FormRow>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Adding…' : 'Add Product'}
        </Button>
      </div>
    </form>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

interface CampaignProductsSectionProps {
  campaignId: string
  isTerminal?: boolean
}

export function CampaignProductsSection({ campaignId, isTerminal }: CampaignProductsSectionProps) {
  const { data: products = [], isLoading } = useCampaignProducts(campaignId)
  const { mutate: removeProduct } = useRemoveCampaignProduct(campaignId)
  const { isManager } = useRole()

  const [showAddForm, setShowAddForm]     = useState(false)
  const [removingItem, setRemovingItem]   = useState<CampaignProduct | null>(null)

  function handleRemove() {
    if (!removingItem?.id) return
    removeProduct(removingItem.id, {
      onSuccess: () => {
        toast('Product removed from campaign', { variant: 'success' })
        setRemovingItem(null)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-foreground">Products</h2>
          {products.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {products.length}
            </span>
          )}
        </div>
        {isManager && !isTerminal && !showAddForm && (
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
            Add Product
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddProductForm campaignId={campaignId} onDone={() => setShowAddForm(false)} />
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : products.length === 0 && !showAddForm ? (
        <p className="text-sm text-muted-foreground">
          No products associated yet. Add products to track what this campaign promotes.
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.productName ?? '—'}
                  </p>
                  {item.isPrimary && (
                    <Star
                      className="h-3.5 w-3.5 text-amber-500 shrink-0"
                      strokeWidth={1.5}
                      fill="currentColor"
                    />
                  )}
                </div>
                {(item.productStrength || item.productDosageForm) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {[item.productStrength, item.productDosageForm].filter(Boolean).join(' · ')}
                  </p>
                )}
                {item.productGenericName && (
                  <p className="text-xs text-muted-foreground truncate">{item.productGenericName}</p>
                )}
              </div>
              {item.isPrimary && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded px-1.5 py-0.5 shrink-0">
                  Primary
                </span>
              )}
              {isManager && !isTerminal && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => setRemovingItem(item)}
                  aria-label="Remove product"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!removingItem}
        onCancel={() => setRemovingItem(null)}
        onConfirm={handleRemove}
        title="Remove Product?"
        description={`Remove "${removingItem?.productName}" from this campaign?`}
        confirmLabel="Remove"
      />
    </div>
  )
}
