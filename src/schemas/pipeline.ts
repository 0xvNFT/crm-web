import { z } from 'zod'

export const pipelineStageSchema = z.object({
  name:         z.string().trim().min(1, 'Stage name is required').max(100),
  displayOrder: z.coerce.number<number>().int().min(0).max(999),
  probability:  z.coerce.number<number>().min(0).max(100),
  isWon:        z.boolean(),
  isLost:       z.boolean(),
  isDefault:    z.boolean(),
  isActive:     z.boolean(),
})
export type PipelineStageFormData = z.infer<typeof pipelineStageSchema>
