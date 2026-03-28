import { z } from 'zod'

export const repTargetSchema = z.object({
  repId: z.string().min(1, 'Rep is required'),
  territoryId: z.string().min(1, 'Territory is required'),
  targetVisits: z.coerce.number<number>().int().min(1, 'Required'),
  targetContacts: z.coerce.number<number>().int().min(1, 'Required'),
  targetCalls: z.coerce.number<number>().int().min(1, 'Required'),
})

export type RepTargetFormData = z.infer<typeof repTargetSchema>
