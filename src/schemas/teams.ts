import { z } from 'zod'
import { emailField, notesField } from './primitives'

export const createTeamSchema = z.object({
  name:         z.string().trim().min(2, 'Team name must be at least 2 characters'),
  teamType:     z.string().optional(),
  description:  notesField,
  emailAddress: emailField,
})
export type CreateTeamFormData = z.infer<typeof createTeamSchema>

export const updateTeamSchema = createTeamSchema
export type UpdateTeamFormData = z.infer<typeof updateTeamSchema>
