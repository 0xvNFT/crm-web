import { z } from 'zod'

// Used by AccountFormPage (create)
export const accountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters'),
  accountType: z.string().min(1, 'Account type is required'),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative('Must be 0 or greater').optional(),
  paymentTerms: z.string().optional(),
  deaNumber: z.string().optional(),
  stateLicenseNumber: z.string().optional(),
  controlledSubstanceApproved: z.boolean().optional(),
})
export type AccountFormData = z.infer<typeof accountSchema>

// Used by AccountDetailPage (inline edit)
export const accountEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  accountType: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.coerce.number().nonnegative('Must be 0 or greater').optional(),
  paymentTerms: z.string().optional(),
  status: z.string().optional(),
  deaNumber: z.string().optional(),
  stateLicenseNumber: z.string().optional(),
  controlledSubstanceApproved: z.boolean().optional(),
})
export type AccountEditFormData = z.infer<typeof accountEditSchema>
