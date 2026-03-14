import { useState } from 'react'
import { useFieldArray, useWatch, useController } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { Trash2, Plus } from 'lucide-react'
import { useProductSearch, useProductBatches, useCurrentPrice } from '@/api/endpoints/products'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/utils/formatters'
import type { PharmaProduct, PharmaProductBatch } from '@/api/app-types'
import type { OrderFormData } from '@/schemas/orders'

interface LineItemsFieldProps {
  control: Control<OrderFormData>
  errors: FieldErrors<OrderFormData>
  accountId: string
}

interface RowProps {
  index: number
  control: Control<OrderFormData>
  errors: FieldErrors<OrderFormData>
  onRemove: () => void
  canRemove: boolean
  accountId: string
}

function LineItemRow({ index, control, errors, onRemove, canRemove, accountId }: RowProps) {
  const [productQuery, setProductQuery] = useState('')
  const [cachedProducts, setCachedProducts] = useState<PharmaProduct[]>([])

  const { data: searchResults, isLoading: isSearching } = useProductSearch(productQuery)

  // Cache results so the label stays after the user stops typing
  const mergedProducts = [
    ...cachedProducts,
    ...(searchResults ?? []).filter((p) => !cachedProducts.find((c) => c.id === p.id)),
  ]

  const productOptions = mergedProducts
    .filter((p) => p.id && p.name)
    .map((p) => ({
      value: p.id!,
      label: p.name,
      sublabel: p.genericName ?? undefined,
    }))

  const { field: productField } = useController({ control, name: `items.${index}.productId` })
  const { field: batchField } = useController({ control, name: `items.${index}.batchId` })
  const { field: quantityField } = useController({ control, name: `items.${index}.quantity` })
  const { field: discountField } = useController({ control, name: `items.${index}.discountPercent` })

  const productId = useWatch({ control, name: `items.${index}.productId` })
  const quantity = useWatch({ control, name: `items.${index}.quantity` })
  const discountPercent = useWatch({ control, name: `items.${index}.discountPercent` })

  const { data: batches } = useProductBatches(productId ?? '')
  const availableBatches = (batches ?? []).filter((b) => b.status === 'available')
  const hasBatches = availableBatches.length > 0

  const selectedProduct = mergedProducts.find((p) => p.id === productId)
  const { data: resolvedPrice } = useCurrentPrice(productId ?? '', accountId)
  const unitPrice = resolvedPrice ?? selectedProduct?.unitPrice ?? 0
  const qty = Number(quantity) || 0
  const discount = Number(discountPercent) || 0
  const lineTotal = qty * unitPrice * (1 - discount / 100)

  const itemErrors = errors.items?.[index]

  function handleProductChange(value: string) {
    productField.onChange(value)
    // Clear batch when product changes
    batchField.onChange(undefined)
    // Cache the newly-visible search results so the selected label persists
    if (searchResults) {
      setCachedProducts((prev) => [
        ...prev,
        ...(searchResults ?? []).filter((p) => !prev.find((c) => c.id === p.id)),
      ])
    }
  }

  function handleSearchChange(q: string) {
    setProductQuery(q)
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_5rem_5rem_2rem]">
        {/* Product */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Product</p>
          <Combobox
            value={productField.value ?? ''}
            onChange={handleProductChange}
            options={productOptions}
            placeholder="Search product..."
            searchPlaceholder="Type product name..."
            onSearchChange={handleSearchChange}
            isLoading={isSearching}
            error={!!itemErrors?.productId}
          />
          {itemErrors?.productId && (
            <p className="text-xs text-destructive">{itemErrors.productId.message}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Qty</p>
          <Input
            type="number"
            min={1}
            {...quantityField}
            onChange={(e) => quantityField.onChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={itemErrors?.quantity ? 'border-destructive' : ''}
          />
          {itemErrors?.quantity && (
            <p className="text-xs text-destructive">{itemErrors.quantity.message}</p>
          )}
        </div>

        {/* Discount */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Disc %</p>
          <Input
            type="number"
            min={0}
            max={100}
            step={0.01}
            {...discountField}
            onChange={(e) => discountField.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          />
        </div>

        {/* Remove */}
        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={!canRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Batch selector — only when product has available batches */}
      {productId && hasBatches && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Batch (optional)</p>
          <Select value={batchField.value ?? ''} onValueChange={batchField.onChange}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Select batch..." />
            </SelectTrigger>
            <SelectContent>
              {availableBatches.map((batch: PharmaProductBatch) => (
                <SelectItem key={batch.id!} value={batch.id!}>
                  {batch.batchNumber}
                  {batch.expiryDate && ` · exp ${formatDate(batch.expiryDate)}`}
                  {batch.quantityAvailable != null && ` · ${batch.quantityAvailable} left`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Line total */}
      {productId && qty > 0 && (
        <div className="flex justify-end pt-1">
          <p className="text-xs text-muted-foreground">
            {qty} × {formatCurrency(unitPrice)}
            {discount > 0 && ` − ${discount}%`}
            {' = '}
            <span className="font-semibold text-foreground">{formatCurrency(lineTotal)}</span>
          </p>
        </div>
      )}
    </div>
  )
}

export function LineItemsField({ control, errors, accountId }: LineItemsFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Line Items</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ productId: '', batchId: undefined, quantity: 1, discountPercent: 0 })}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Item
        </Button>
      </div>

      {errors.items?.root && (
        <p className="text-xs text-destructive">{errors.items.root.message}</p>
      )}
      {typeof errors.items?.message === 'string' && (
        <p className="text-xs text-destructive">{errors.items.message}</p>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => (
          <LineItemRow
            key={field.id}
            index={index}
            control={control}
            errors={errors}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
            accountId={accountId}
          />
        ))}
      </div>
    </div>
  )
}
