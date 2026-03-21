import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  teamType: z.string().optional().transform(v => v || undefined),
  description: z.string().optional(),
  emailAddress: z.string().email('Invalid email').optional().or(z.literal('')),
})
export type CreateTeamFormData = z.infer<typeof createTeamSchema>

export const updateTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  teamType: z.string().optional().transform(v => v || undefined),
  description: z.string().optional(),
  emailAddress: z.string().email('Invalid email').optional().or(z.literal('')),
})
export type UpdateTeamFormData = z.infer<typeof updateTeamSchema>
