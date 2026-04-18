import { z } from 'zod'
import { notesField } from './primitives'

export const quoteItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number<number>().int().min(1, 'Quantity must be at least 1'),
  // Backend @NotNull — required field. Default 0 means no discount.
  discountPercent: z.coerce.number<number>().min(0, 'Must be 0 or greater').max(100, 'Cannot exceed 100%'),
  notes: notesField,
})

export const quoteSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  contactId: z.string().optional(),
  opportunityId: z.string().optional(),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
  discountPercent: z.coerce.number<number>().min(0).max(100).optional(),
  taxAmount: z.coerce.number<number>().min(0).optional(),
  notes: notesField,
})

export type QuoteFormData = z.infer<typeof quoteSchema>
export type QuoteItemFormData = z.infer<typeof quoteItemSchema>
