import { useFieldArray, useController } from 'react-hook-form'
import type { Control, FieldErrors } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { LineItemRow } from '@/components/shared/LineItemRow'
import type { QuoteFormData } from '@/schemas/quotes'

interface QuoteLineItemsFieldProps {
  control: Control<QuoteFormData>
  errors: FieldErrors<QuoteFormData>
  accountId: string
}

interface NotesExtrasProps {
  index: number
  control: Control<QuoteFormData>
}

function NotesExtras({ index, control }: NotesExtrasProps) {
  const { field: notesField } = useController({ control, name: `items.${index}.notes` })

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">Item Notes</p>
      <Input
        {...notesField}
        value={notesField.value ?? ''}
        placeholder="Optional note for this item..."
      />
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
            extras={() => <NotesExtras index={index} control={control} />}
          />
        ))}
      </div>
    </div>
  )
}
