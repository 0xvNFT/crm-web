import { z } from 'zod'

export const quoteItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
})

export const quoteSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  contactId: z.string().optional(),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  items: z.array(quoteItemSchema).min(1, 'At least one item is required'),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  taxAmount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
})

export type QuoteFormData = z.infer<typeof quoteSchema>
export type QuoteItemFormData = z.infer<typeof quoteItemSchema>
