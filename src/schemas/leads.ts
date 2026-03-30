import { z } from 'zod'

export const leadSchema = z.object({
  lastName:    z.string().min(1, 'Last name is required'),
  firstName:   z.string().optional(),
  companyName: z.string().optional(),
  email:       z.string().email('Invalid email').optional().or(z.literal('')),
  phone:       z.string().optional(),
  leadStatus:  z.string().optional(),
  rating:      z.string().optional(),
  leadSource:  z.string().optional(),
  leadScore:   z.coerce.number<number>().int().min(0).optional(),
})

export type LeadFormData = z.infer<typeof leadSchema>
