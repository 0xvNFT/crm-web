import { useState } from 'react'
import { useFieldArray, useWatch, useController } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { Trash2, Plus } from 'lucide-react'
import { useProductSearch, useCurrentPrice } from '@/api/endpoints/products'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/utils/formatters'
import type { PharmaProduct } from '@/api/app-types'
import type { QuoteFormData } from '@/schemas/quotes'

interface QuoteLineItemsFieldProps {
  control: Control<QuoteFormData>
  errors: FieldErrors<QuoteFormData>
  accountId: string
}

interface RowProps {
  index: number
  control: Control<QuoteFormData>
  errors: FieldErrors<QuoteFormData>
  onRemove: () => void
  canRemove: boolean
  accountId: string
}

function QuoteLineItemRow({ index, control, errors, onRemove, canRemove, accountId }: RowProps) {
  const [productQuery, setProductQuery] = useState('')
  const [cachedProducts, setCachedProducts] = useState<PharmaProduct[]>([])

  const { data: searchResults, isLoading: isSearching } = useProductSearch(productQuery)

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
  const { field: quantityField } = useController({ control, name: `items.${index}.quantity` })
  const { field: discountField } = useController({ control, name: `items.${index}.discountPercent` })
  const { field: notesField } = useController({ control, name: `items.${index}.notes` })

  const productId = useWatch({ control, name: `items.${index}.productId` })
  const quantity = useWatch({ control, name: `items.${index}.quantity` })
  const discountPercent = useWatch({ control, name: `items.${index}.discountPercent` })

  const selectedProduct = mergedProducts.find((p) => p.id === productId)
  const { data: resolvedPrice } = useCurrentPrice(productId ?? '', accountId)
  const unitPrice = resolvedPrice ?? selectedProduct?.unitPrice ?? 0
  const qty = Number(quantity) || 0
  const discount = Number(discountPercent) || 0
  const lineTotal = qty * unitPrice * (1 - discount / 100)

  const itemErrors = errors.items?.[index]

  function handleProductChange(value: string) {
    productField.onChange(value)
    if (searchResults) {
      setCachedProducts((prev) => [
        ...prev,
        ...(searchResults ?? []).filter((p) => !prev.find((c) => c.id === p.id)),
      ])
    }
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
            onSearchChange={setProductQuery}
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
            value={quantityField.value ?? ''}
            onChange={(e) => quantityField.onChange(e.target.value === '' ? '' : Number(e.target.value))}
            onBlur={quantityField.onBlur}
            name={quantityField.name}
            ref={quantityField.ref}
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
            value={discountField.value ?? ''}
            onChange={(e) => discountField.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
            onBlur={discountField.onBlur}
            name={discountField.name}
            ref={discountField.ref}
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

      {/* Per-item notes */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Item Notes</p>
        <Input
          placeholder="Optional note for this item..."
          value={notesField.value ?? ''}
          onChange={notesField.onChange}
          onBlur={notesField.onBlur}
          name={notesField.name}
          ref={notesField.ref}
        />
      </div>

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

export function QuoteLineItemsField({ control, errors, accountId }: QuoteLineItemsFieldProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Line Items</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ productId: '', quantity: 1, discountPercent: 0, notes: '' })}
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
          <QuoteLineItemRow
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
