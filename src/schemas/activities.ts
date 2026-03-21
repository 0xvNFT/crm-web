import { z } from 'zod'

export const activitySchema = z.object({
  subject:          z.string().min(1, 'Subject is required'),
  activityType:     z.string().min(1, 'Type is required'),
  assignedUserId:   z.string().min(1, 'Owner is required'),
  status:           z.string().optional(),
  priority:         z.string().optional(),
  dueDate:          z.string().optional(),
  durationMinutes:  z.coerce.number<number>().int().min(0).optional(),
  description:      z.string().optional(),
})

export type ActivityFormData = z.infer<typeof activitySchema>
