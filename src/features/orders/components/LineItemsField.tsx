import { useFieldArray, useController } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { useProductBatches } from '@/api/endpoints/products'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { LineItemRow } from '@/components/shared/LineItemRow'
import { formatDate } from '@/utils/formatters'
import type { PharmaProduct, PharmaProductBatch } from '@/api/app-types'
import type { OrderFormData } from '@/schemas/orders'

interface LineItemsFieldProps {
  control: Control<OrderFormData>
  errors: FieldErrors<OrderFormData>
  accountId: string
}

interface BatchExtrasProps {
  index: number
  control: Control<OrderFormData>
  mergedProducts: PharmaProduct[]
}

function BatchExtras({ index, control, mergedProducts: _mergedProducts }: BatchExtrasProps) {
  const { field: productIdField } = useController({ control, name: `items.${index}.productId` })
  const { field: batchField } = useController({ control, name: `items.${index}.batchId` })

  const productId = productIdField.value as string | undefined
  const { data: batches } = useProductBatches(productId ?? '')
  const availableBatches = (batches ?? []).filter((b) => b.status === 'available')

  if (!productId || availableBatches.length === 0) return null

  return (
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
          <Plus className="h-3.5 w-3.5 mr-1" strokeWidth={1.5} />
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
            productIdPath={`items.${index}.productId`}
            quantityPath={`items.${index}.quantity`}
            discountPath={`items.${index}.discountPercent`}
            productError={errors.items?.[index]?.productId?.message}
            quantityError={errors.items?.[index]?.quantity?.message}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1}
            accountId={accountId}
            extras={(mergedProducts) => (
              <BatchExtras index={index} control={control} mergedProducts={mergedProducts} />
            )}
          />
        ))}
      </div>
    </div>
  )
}
