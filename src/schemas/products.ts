import { z } from 'zod'
import { moneyRequired } from './primitives'

export const productSchema = z.object({
  ndcNumber:           z.string().trim().min(1, 'NDC number is required'),
  name:                z.string().trim().min(1, 'Product name is required'),
  genericName:         z.string().trim().optional(),
  manufacturer:        z.string().trim().optional(),
  strength:            z.string().trim().optional(),
  dosageForm:          z.string().optional(),
  packageSize:         z.string().trim().optional(),
  unitPrice:           moneyRequired,
  status:              z.string().min(1, 'Status is required'),
  controlledSubstance: z.boolean().optional(),
  deaSchedule:         z.string().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
