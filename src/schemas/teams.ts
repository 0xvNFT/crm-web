import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  teamType: z.enum(['owner', 'access']).optional(),
  description: z.string().optional(),
  emailAddress: z.string().email('Invalid email').optional().or(z.literal('')),
})
export type CreateTeamFormData = z.infer<typeof createTeamSchema>
