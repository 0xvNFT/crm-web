import { z } from 'zod'

// Used by AccountFormPage (create)
export const accountSchema = z.object({
  name: z.string().min(2, 'Account name must be at least 2 characters'),
  accountType: z.string().min(1, 'Account type is required'),
  status: z.string().optional(),
  ownerId: z.string().optional(),
  parentAccountId: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  phoneMain: z.string().optional(),
  emailGeneral: z.string().email('Must be a valid email').optional().or(z.literal('')),
  primaryCustomerClass: z.string().optional(),
  annualRevenue: z.coerce.number<number>().nonnegative('Must be 0 or greater').optional(),
  employees: z.coerce.number<number>().int().nonnegative().optional(),
  isSupplier: z.boolean().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  taxId: z.string().optional(),
  creditLimit: z.coerce.number<number>().nonnegative('Must be 0 or greater').optional(),
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
  status: z.string().optional(),
  ownerId: z.string().optional(),
  parentAccountId: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  phoneMain: z.string().optional(),
  emailGeneral: z.string().email('Must be a valid email').optional().or(z.literal('')),
  primaryCustomerClass: z.string().optional(),
  annualRevenue: z.coerce.number<number>().nonnegative('Must be 0 or greater').optional(),
  employees: z.coerce.number<number>().int().nonnegative().optional(),
  isSupplier: z.boolean().optional(),
  creditLimit: z.coerce.number<number>().nonnegative('Must be 0 or greater').optional(),
  paymentTerms: z.string().optional(),
  taxId: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  deaNumber: z.string().optional(),
  stateLicenseNumber: z.string().optional(),
  controlledSubstanceApproved: z.boolean().optional(),
})
export type AccountEditFormData = z.infer<typeof accountEditSchema>
