import { z } from 'zod'
import { notesField, dateField, moneyField } from './primitives'

export const opportunityFormSchema = z.object({
  topic:            z.string().trim().min(1, 'Topic is required'),
  description:      notesField,
  accountId:        z.string().min(1, 'Account is required'),
  ownerId:          z.string().min(1, 'Owner is required'),
  contactId:        z.string().optional(),
  territoryId:      z.string().optional(),
  salesStage:       z.string().optional(),
  status:           z.string().optional(),
  estRevenue:       moneyField,
  probabilityPct:   z.coerce.number<number>().int().min(0).max(100).optional(),
  currency:         z.string().optional(),
  estCloseDate:     dateField,
  actualCloseDate:  dateField,
  forecastCategory: z.string().optional(),
  leadSource:       z.string().optional(),
  type:             z.string().optional(),
  budgetConfirmed:  z.boolean().optional(),
})

export type OpportunityFormData = z.infer<typeof opportunityFormSchema>

export const opportunityEditSchema = opportunityFormSchema.partial().extend({
  topic: z.string().trim().min(1, 'Topic is required'),
})

export type OpportunityEditFormData = z.infer<typeof opportunityEditSchema>

// ── Opportunity Line Items ────────────────────────────────────────────────────

export const addOpportunityProductSchema = z.object({
  productId:   z.string({ error: 'Select a product' }).min(1, 'Select a product'),
  quantity:    z.coerce.number<number>().positive('Quantity must be greater than 0'),
  unitPrice:   moneyField,
  discountPct: z.coerce.number<number>().min(0, 'Must be 0 or greater').max(100, 'Must be 100 or less').optional(),
  notes:       notesField,
})

export type AddOpportunityProductFormData = z.infer<typeof addOpportunityProductSchema>

// Edit is a full partial of add (product cannot be changed — must remove + re-add)
export const updateOpportunityProductSchema = addOpportunityProductSchema
  .omit({ productId: true })
  .partial()

export type UpdateOpportunityProductFormData = z.infer<typeof updateOpportunityProductSchema>
