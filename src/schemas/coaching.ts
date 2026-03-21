import { z } from 'zod'

export const coachingNoteSchema = z.object({
  coachId:           z.string().uuid('Invalid coach'),
  repId:             z.string().uuid('Invalid rep'),
  noteTitle:         z.string().min(2, 'Title must be at least 2 characters'),
  feedbackType:      z.string().min(1, 'Feedback type is required'),
  detailedFeedback:  z.string().min(1, 'Detailed feedback is required'),
  summaryOfFeedback: z.string().optional(),
  visitId:           z.string().uuid().optional().or(z.literal('')).transform(v => v || undefined),
  territoryId:       z.string().uuid().optional().or(z.literal('')).transform(v => v || undefined),
  reviewedModule:    z.string().optional().transform(v => v || undefined),
  moduleProgressPct: z.coerce.number().min(0).max(100).optional(),
  followUpRequired:  z.boolean().optional(),
  followUpDate:      z.string().optional(),
  dateProvided:      z.string().optional(),
})

export type CoachingNoteFormData = z.infer<typeof coachingNoteSchema>

export const coachingNoteEditSchema = z.object({
  noteTitle:         z.string().min(2, 'Title must be at least 2 characters').optional(),
  feedbackType:      z.string().optional().transform(v => v || undefined),
  detailedFeedback:  z.string().optional(),
  summaryOfFeedback: z.string().optional(),
  reviewedModule:    z.string().optional().transform(v => v || undefined),
  moduleProgressPct: z.coerce.number().min(0).max(100).optional(),
  followUpRequired:  z.boolean().optional(),
  followUpDate:      z.string().optional(),
})

export type CoachingNoteEditFormData = z.infer<typeof coachingNoteEditSchema>
