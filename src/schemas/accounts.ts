import { z } from 'zod'
import { phoneField, emailField, urlField, orgNameField, moneyField, countField } from './primitives'

// Used by AccountFormPage (create)
export const accountSchema = z.object({
  name: orgNameField('Account name'),
  accountType: z.string().min(1, 'Account type is required'),
  status: z.string().optional(),
  ownerId: z.string().optional(),
  parentAccountId: z.string().optional(),
  website: urlField,
  phoneMain: phoneField,
  emailGeneral: emailField,
  primaryCustomerClass: z.string().optional(),
  annualRevenue: moneyField,
  employees: countField,
  isSupplier: z.boolean().optional(),
  billingAddress: z.string().trim().optional(),
  shippingAddress: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
  creditLimit: moneyField,
  paymentTerms: z.string().optional(),
  deaNumber: z.string().trim().optional(),
  stateLicenseNumber: z.string().trim().optional(),
  controlledSubstanceApproved: z.boolean().optional(),
})
export type AccountFormData = z.infer<typeof accountSchema>

// Used by AccountDetailPage (inline edit)
// All required-on-create fields become optional here — partial updates allowed
export const accountEditSchema = accountSchema
  .partial()
  .extend({
    // name stays validated when provided
    name: orgNameField('Name').optional(),
  })
export type AccountEditFormData = z.infer<typeof accountEditSchema>
