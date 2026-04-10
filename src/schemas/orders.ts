import { z } from 'zod'
import { notesField, dateField } from './primitives'

export const orderItemSchema = z.object({
  productId:       z.string().min(1, 'Product is required'),
  batchId:         z.string().optional(),
  quantity:        z.coerce.number<number>().int().min(1, 'Quantity must be at least 1'),
  discountPercent: z.coerce.number<number>().min(0).max(100).optional(),
})

export const orderSchema = z.object({
  accountId:       z.string().min(1, 'Account is required'),
  items:           z.array(orderItemSchema).min(1, 'At least one item is required'),
  discountPercent: z.coerce.number<number>().min(0).max(100).optional(),
  taxAmount:       z.coerce.number<number>().min(0).optional(),
  deliveryDate:    dateField,
  notes:           notesField,
})

export type OrderFormData     = z.infer<typeof orderSchema>
export type OrderItemFormData = z.infer<typeof orderItemSchema>
