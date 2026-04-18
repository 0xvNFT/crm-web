import { z } from 'zod'
import { notesField, dateRequired } from './primitives'

export const invoiceItemSchema = z.object({
  productId:      z.string().optional(),
  description:    notesField,
  quantity:       z.coerce.number<number>().int().min(1, 'Quantity must be at least 1'),
  unitPrice:      z.coerce.number<number>().min(0, 'Unit price must be 0 or greater'),
  discountAmount: z.coerce.number<number>().min(0).optional(),
  taxAmount:      z.coerce.number<number>().min(0).optional(),
})

export const invoiceCreateSchema = z.object({
  accountId:       z.string().min(1, 'Account is required'),
  contactId:       z.string().optional(),
  subject:         z.string().trim().min(1, 'Subject is required'),
  invoiceDate:     dateRequired('Invoice date'),
  dueDate:         dateRequired('Due date'),
  billingAddress:  z.string().trim().min(1, 'Billing address is required'),
  paymentTerms:    z.string().optional(),
  currency:        z.string().optional(),
  shippingAddress: z.string().trim().optional(),
  shippingMethod:  z.string().trim().optional(),
  taxExempt:       z.boolean().optional(),
  items:           z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
})

export const invoiceEditSchema = z.object({
  subject:         z.string().trim().min(1, 'Subject is required'),
  invoiceDate:     dateRequired('Invoice date'),
  dueDate:         dateRequired('Due date'),
  billingAddress:  z.string().trim().min(1, 'Billing address is required'),
  paymentTerms:    z.string().optional(),
  currency:        z.string().optional(),
  shippingAddress: z.string().trim().optional(),
  shippingMethod:  z.string().trim().optional(),
  taxExempt:       z.boolean().optional(),
})

export type InvoiceCreateFormData = z.infer<typeof invoiceCreateSchema>
export type InvoiceEditFormData   = z.infer<typeof invoiceEditSchema>
export type InvoiceItemFormData   = z.infer<typeof invoiceItemSchema>
