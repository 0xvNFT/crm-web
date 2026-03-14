import { z } from 'zod'

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  batchId: z.string().optional(),
  quantity: z.number({ coerce: true }).int().min(1, 'Quantity must be at least 1'),
  discountPercent: z.number({ coerce: true }).min(0).max(100).default(0),
})

export const orderSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  discountPercent: z.number({ coerce: true }).min(0).max(100).optional(),
  taxAmount: z.number({ coerce: true }).min(0).optional(),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
})

export type OrderFormData = z.infer<typeof orderSchema>
export type OrderItemFormData = z.infer<typeof orderItemSchema>
