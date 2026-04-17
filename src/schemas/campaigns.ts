import { z } from 'zod'
import { orgNameField, notesField, dateField, moneyField } from './primitives'

// ─── Create / Edit schemas ────────────────────────────────────────────────────
export const campaignFormSchema = z.object({
  name:        orgNameField('Campaign name'),
  description: notesField,
  type:        z.string().optional(),
  startDate:   dateField,
  endDate:     dateField,
  budget:      moneyField,
  ownerId:     z.string().optional(),
  territoryId: z.string().optional(),
})

export type CampaignFormData = z.infer<typeof campaignFormSchema>

export const campaignEditSchema = campaignFormSchema.partial().extend({
  name: orgNameField('Campaign name'),
})

export type CampaignEditFormData = z.infer<typeof campaignEditSchema>

// ─── Add contact schema ───────────────────────────────────────────────────────
export const addCampaignContactSchema = z.object({
  contactId: z.string({ error: 'Select a contact' }).min(1, 'Select a contact'),
  notes:     notesField,
})

export type AddCampaignContactFormData = z.infer<typeof addCampaignContactSchema>

// ─── Update contact status schema ─────────────────────────────────────────────
export const updateCampaignContactSchema = z.object({
  status: z.string().optional(),
  notes:  notesField,
})

export type UpdateCampaignContactFormData = z.infer<typeof updateCampaignContactSchema>

// ─── Add product schema ───────────────────────────────────────────────────────
export const addCampaignProductSchema = z.object({
  productId: z.string({ error: 'Select a product' }).min(1, 'Select a product'),
  isPrimary: z.boolean().optional(),
})

export type AddCampaignProductFormData = z.infer<typeof addCampaignProductSchema>
