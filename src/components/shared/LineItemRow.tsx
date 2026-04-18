/**
 * Shared line-item row used by both OrderFormPage and QuoteFormPage.
 * Handles product search, label caching, pricing resolution, and totals display.
 * Callers pass `extras` to render feature-specific fields (batch for orders, notes for quotes).
 */
import { useState, type ReactNode } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useController, useWatch } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { useProductSearch, useCurrentPrice } from '@/api/endpoints/products'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/utils/formatters'
import type { PharmaProduct } from '@/api/app-types'

export interface LineItemRowProps<T extends FieldValues> {
  index: number
  control: Control<T>
  productIdPath: Path<T>
  quantityPath: Path<T>
  discountPath: Path<T>
  productError?: string
  quantityError?: string
  onRemove: () => void
  canRemove: boolean
  accountId: string
  /** Slot for feature-specific fields rendered below the main row (batch, notes, etc.) */
  extras?: (mergedProducts: PharmaProduct[]) => ReactNode
}

export function LineItemRow<T extends FieldValues>({
  index: _index,
  control,
  productIdPath,
  quantityPath,
  discountPath,
  productError,
  quantityError,
  onRemove,
  canRemove,
  accountId,
  extras,
}: LineItemRowProps<T>) {
  const [productQuery, setProductQuery] = useState('')
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

  const { field: productField } = useController({ control, name: productIdPath })
  const { field: quantityField } = useController({ control, name: quantityPath })
  const { field: discountField } = useController({ control, name: discountPath })

  const productId = useWatch({ control, name: productIdPath }) as string | undefined
  const quantity = useWatch({ control, name: quantityPath }) as number | string | undefined
  const discountPercent = useWatch({ control, name: discountPath }) as number | string | undefined

  const selectedProduct = mergedProducts.find((p) => p.id === productId)
  const { data: resolvedPrice } = useCurrentPrice(productId ?? '', accountId)
  const unitPrice = resolvedPrice ?? selectedProduct?.unitPrice ?? 0
  const qty = Number(quantity) || 0
  const discount = Number(discountPercent) || 0
  const lineTotal = qty * unitPrice * (1 - discount / 100)

  function handleProductChange(value: string) {
    productField.onChange(value)
    if (searchResults) {
      setCachedProducts((prev) => [
        ...prev,
        ...(searchResults).filter((p) => !prev.find((c) => c.id === p.id)),
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
            error={!!productError}
          />
          {productError && <p className="text-xs text-destructive">{productError}</p>}
        </div>

        {/* Quantity */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Qty</p>
          <Input
            type="number"
            min={1}
            {...quantityField}
            onChange={(e) => quantityField.onChange(e.target.value === '' ? '' : Number(e.target.value))}
            className={quantityError ? 'border-destructive' : ''}
          />
          {quantityError && <p className="text-xs text-destructive">{quantityError}</p>}
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
            aria-label="Remove line item"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {/* Feature-specific extras (batch selector, notes field, etc.) */}
      {extras?.(mergedProducts)}

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
