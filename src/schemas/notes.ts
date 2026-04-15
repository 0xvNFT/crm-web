import { z } from 'zod'

// Note body is required; title is optional. noteType is config-driven (z.string()).
export const createNoteSchema = z.object({
  title:    z.string().trim().max(255, 'Title must be 255 characters or less').optional(),
  body:     z.string().trim().min(1, 'Note body is required').max(2000, 'Note must be 2000 characters or less'),
  noteType: z.string().optional(),
})

// Edit schema — title and noteType optional, but body stays required (backend rejects empty body)
export const updateNoteSchema = createNoteSchema.partial().extend({
  body: z.string().trim().min(1, 'Note body is required').max(2000, 'Note must be 2000 characters or less'),
})

export type CreateNoteFormValues = z.infer<typeof createNoteSchema>
export type UpdateNoteFormValues = z.infer<typeof updateNoteSchema>
