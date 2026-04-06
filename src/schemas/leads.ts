import { z } from 'zod'
import { nameField, emailField, phoneField } from './primitives'

export const leadSchema = z.object({
  lastName:    nameField('Last name'),
  firstName:   z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  email:       emailField,
  phone:       phoneField,
  leadStatus:  z.string().optional(),
  rating:      z.string().optional(),
  leadSource:  z.string().optional(),
  leadScore:   z.coerce.number<number>().int().min(0).optional(),
  // Additional fields rendered in the form when present
  topic:             z.string().trim().optional(),
  industry:          z.string().trim().optional(),
  estimatedBudget:   z.coerce.number<number>().nonnegative().optional(),
  decisionTimeframe: z.string().trim().optional(),
  purchaseProcess:   z.string().trim().optional(),
  emailOptOut:       z.boolean().optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>
