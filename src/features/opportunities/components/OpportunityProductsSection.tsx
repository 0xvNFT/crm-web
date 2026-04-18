import { useState } from 'react'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  useOpportunityProducts,
  useAddOpportunityProduct,
  useUpdateOpportunityProduct,
  useRemoveOpportunityProduct,
} from '@/api/endpoints/opportunities'
import { useProductSearch, useCurrentPrice } from '@/api/endpoints/products'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Combobox } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { FormRow } from '@/components/shared/FormRow'
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import {
  addOpportunityProductSchema,
  updateOpportunityProductSchema,
  type AddOpportunityProductFormData,
  type UpdateOpportunityProductFormData,
} from '@/schemas/opportunities'
import type { OpportunityProduct, PharmaProduct } from '@/api/app-types'

// ─── Add form ─────────────────────────────────────────────────────────────────

function AddProductForm({
  opportunityId,
  accountId,
  onDone,
}: {
  opportunityId: string
  accountId: string
  onDone: () => void
}) {
  const [productQuery, setProductQuery] = useState('')
  // Cache results so the selected label persists after the user stops typing
  const [cachedProducts, setCachedProducts] = useState<PharmaProduct[]>([])

  const debouncedProductQuery = useDebounce(productQuery, 300)
  const { data: searchResults, isLoading: isSearching } = useProductSearch(debouncedProductQuery)

  const mergedProducts = [
    ...cachedProducts,
    ...(searchResults ?? []).filter((p) => !cachedProducts.find((c) => c.id === p.id)),
  ]
  const productOptions = mergedProducts
    .filter((p) => p.id && p.name)
    .map((p) => ({ value: p.id!, label: p.name!, sublabel: p.genericName ?? undefined }))

  const { mutate: addProduct, isPending } = useAddOpportunityProduct(opportunityId)

  const { register, handleSubmit, control, setValue, formState: { errors } } =
    useForm<AddOpportunityProductFormData>({
      resolver: zodResolver(addOpportunityProductSchema),
      defaultValues: { quantity: 1, discountPct: 0 },
    })

  const selectedProductId = useWatch({ control, name: 'productId' })
  const selectedProduct = mergedProducts.find((p) => p.id === selectedProductId)

  // Resolve contract → list → unitPrice fallback via pricing API (per pricing rule)
  const { data: resolvedPrice } = useCurrentPrice(selectedProductId ?? '', accountId)

  const displayPrice = resolvedPrice ?? (selectedProduct?.unitPrice as number | null | undefined)

  function handleProductChange(id: string) {
    setValue('productId', id)
    if (searchResults) {
      setCachedProducts((prev) => [
        ...prev,
        ...(searchResults).filter((p) => !prev.find((c) => c.id === p.id)),
      ])
    }
    // unitPrice auto-populated via resolvedPrice once useCurrentPrice returns
  }

  function onSubmit(data: AddOpportunityProductFormData) {
    addProduct(
      {
        productId:   data.productId,
        quantity:    data.quantity,
        unitPrice:   data.unitPrice,
        discountPct: data.discountPct ?? 0,
        notes:       data.notes || undefined,
      },
      {
        onSuccess: () => {
          toast('Product added', { variant: 'success' })
          onDone()
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-border/60 rounded-lg p-4 bg-muted/30 space-y-3">
      <h3 className="text-sm font-semibold">Add Product</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormRow label="Product *" fieldId="productId" error={errors.productId?.message}>
          {/* Must use Controller — Combobox is a controlled component; register() won't work */}
          <Controller
            name="productId"
            control={control}
            render={({ field }) => (
              <Combobox
                value={field.value ?? ''}
                onChange={(v) => { field.onChange(v); handleProductChange(v) }}
                options={productOptions}
                placeholder="Search product…"
                searchPlaceholder="Type product name…"
                onSearchChange={setProductQuery}
                isLoading={isSearching}
                error={!!errors.productId}
              />
            )}
          />
        </FormRow>
        <FormRow label="Quantity *" fieldId="quantity" error={errors.quantity?.message}>
          <Input
            id="quantity"
            {...register('quantity')}
            type="number"
            min={0.01}
            step={0.01}
          />
        </FormRow>
        <FormRow
          label={
            displayPrice != null
              ? `Unit Price (default: ${formatCurrency(displayPrice)})`
              : 'Unit Price Override'
          }
          fieldId="unitPrice"
          error={errors.unitPrice?.message}
        >
          <Input
            id="unitPrice"
            {...register('unitPrice')}
            type="number"
            min={0}
            step={0.01}
            placeholder={displayPrice != null ? String(displayPrice) : '0.00'}
          />
        </FormRow>
        <FormRow label="Discount %" fieldId="discountPct" error={errors.discountPct?.message}>
          <Input
            id="discountPct"
            {...register('discountPct')}
            type="number"
            min={0}
            max={100}
            step={0.01}
          />
        </FormRow>
        <div className="sm:col-span-2">
          <FormRow label="Notes" fieldId="notes">
            <TextareaWithCounter
              id="notes"
              {...register('notes')}
              maxLength={2000}
              rows={2}
              placeholder="Optional line item notes…"
            />
          </FormRow>
        </div>
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

// ─── Edit inline form ─────────────────────────────────────────────────────────

function EditProductRow({
  opportunityId,
  item,
  onDone,
}: {
  opportunityId: string
  item: OpportunityProduct
  onDone: () => void
}) {
  const { mutate: updateProduct, isPending } = useUpdateOpportunityProduct(
    opportunityId,
    item.id ?? '',
  )
  const { register, handleSubmit, formState: { errors } } =
    useForm<UpdateOpportunityProductFormData>({
      resolver: zodResolver(updateOpportunityProductSchema),
      defaultValues: {
        quantity:    item.quantity != null ? Number(item.quantity) : undefined,
        unitPrice:   item.unitPrice != null ? Number(item.unitPrice) : undefined,
        discountPct: item.discountPct != null ? Number(item.discountPct) : undefined,
        notes:       item.notes ?? undefined,
      },
    })

  function onSubmit(data: UpdateOpportunityProductFormData) {
    updateProduct(data, {
      onSuccess: () => {
        toast('Line item updated', { variant: 'success' })
        onDone()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-primary/30 rounded-lg p-4 bg-primary/5 space-y-3">
      <p className="text-sm font-medium">{item.productName}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FormRow label="Quantity" fieldId="edit-quantity" error={errors.quantity?.message}>
          <Input
            id="edit-quantity"
            {...register('quantity')}
            type="number"
            min={0.01}
            step={0.01}
          />
        </FormRow>
        <FormRow label="Unit Price" fieldId="edit-unitPrice" error={errors.unitPrice?.message}>
          <Input
            id="edit-unitPrice"
            {...register('unitPrice')}
            type="number"
            min={0}
            step={0.01}
          />
        </FormRow>
        <FormRow label="Discount %" fieldId="edit-discountPct" error={errors.discountPct?.message}>
          <Input
            id="edit-discountPct"
            {...register('discountPct')}
            type="number"
            min={0}
            max={100}
            step={0.01}
          />
        </FormRow>
        <FormRow label="Notes" fieldId="edit-notes">
          <TextareaWithCounter
            id="edit-notes"
            {...register('notes')}
            maxLength={2000}
            rows={2}
            placeholder="Notes…"
          />
        </FormRow>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────

interface OpportunityProductsSectionProps {
  opportunityId: string
  accountId: string
}

export function OpportunityProductsSection({ opportunityId, accountId }: OpportunityProductsSectionProps) {
  const { data: lineItems = [], isLoading } = useOpportunityProducts(opportunityId)
  const { mutate: removeProduct } = useRemoveOpportunityProduct(opportunityId)
  const { isManager } = useRole()

  const [showAddForm, setShowAddForm]   = useState(false)
  const [editingId, setEditingId]       = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<OpportunityProduct | null>(null)

  const grandTotal = lineItems.reduce(
    (sum, li) => sum + ((li.lineTotal as number | null | undefined) ?? 0),
    0,
  )

  function handleRemove() {
    if (!removingItem?.id) return
    removeProduct(removingItem.id, {
      onSuccess: () => {
        toast('Product removed', { variant: 'success' })
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
          {lineItems.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {lineItems.length}
            </span>
          )}
        </div>
        {isManager && !showAddForm && (
          <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
            Add Product
          </Button>
        )}
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddProductForm
          opportunityId={opportunityId}
          accountId={accountId}
          onDone={() => setShowAddForm(false)}
        />
      )}

      {/* Line items */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : lineItems.length === 0 && !showAddForm ? (
        <p className="text-sm text-muted-foreground">
          No products added yet. Add products to track the pipeline value of this opportunity.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          {lineItems.length > 0 && (
            <div className="grid grid-cols-12 gap-2 px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <div className="col-span-4">Product</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-1 text-right">Disc%</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1" />
            </div>
          )}

          {lineItems.map((item) =>
            editingId === item.id ? (
              <EditProductRow
                key={item.id}
                opportunityId={opportunityId}
                item={item}
                onDone={() => setEditingId(null)}
              />
            ) : (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                <div className="col-span-4">
                  <p className="text-sm font-medium text-foreground truncate">{item.productName}</p>
                  {(item.productStrength || item.productDosageForm) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {[item.productStrength, item.productDosageForm].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="col-span-2 text-right text-sm text-foreground">
                  {item.quantity != null ? item.quantity : '—'}
                </div>
                <div className="col-span-2 text-right text-sm text-foreground">
                  {/* Why: OpenAPI codegen types monetary fields as unknown */}
                  {item.unitPrice != null ? formatCurrency(item.unitPrice as number) : '—'}
                </div>
                <div className="col-span-1 text-right text-sm text-muted-foreground">
                  {item.discountPct ? `${item.discountPct}%` : '—'}
                </div>
                <div className="col-span-2 text-right text-sm font-semibold text-foreground">
                  {/* Why: OpenAPI codegen types monetary fields as unknown */}
                  {item.lineTotal != null ? formatCurrency(item.lineTotal as number) : '—'}
                </div>
                <div className="col-span-1 flex justify-end gap-1">
                  {isManager && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditingId(item.id ?? null)}
                        aria-label="Edit line item"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setRemovingItem(item)}
                        aria-label="Remove product"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ),
          )}

          {/* Grand total row */}
          {lineItems.length > 0 && (
            <div className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-lg border border-border/60 bg-card mt-1">
              <div className="col-span-7 text-sm font-semibold text-foreground">
                Total Pipeline Value
              </div>
              <div className="col-span-1" />
              <div className="col-span-3 text-right text-sm font-bold text-foreground">
                {formatCurrency(grandTotal)}
              </div>
              <div className="col-span-1" />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!removingItem}
        onCancel={() => setRemovingItem(null)}
        onConfirm={handleRemove}
        title="Remove Product?"
        description={`Remove "${removingItem?.productName}" from this opportunity?`}
        confirmLabel="Remove"
      />
    </div>
  )
}
