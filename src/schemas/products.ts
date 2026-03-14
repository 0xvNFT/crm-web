import { z } from 'zod'

export const productSchema = z.object({
  ndcNumber: z.string().min(1, 'NDC number is required'),
  name: z.string().min(1, 'Product name is required'),
  genericName: z.string().optional(),
  manufacturer: z.string().optional(),
  strength: z.string().optional(),
  dosageForm: z.string().optional(),
  packageSize: z.string().optional(),
  unitPrice: z.coerce.number<number>().min(0, 'Price must be 0 or greater'),
  status: z.string().min(1, 'Status is required'),
  controlledSubstance: z.boolean().optional(),
  deaSchedule: z.string().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
