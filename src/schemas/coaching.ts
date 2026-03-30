import { z } from 'zod'

export const coachingNoteSchema = z.object({
  coachId:           z.string().uuid('Invalid coach'),
  repId:             z.string().uuid('Invalid rep'),
  noteTitle:         z.string().min(2, 'Title must be at least 2 characters'),
  feedbackType:      z.string().min(1, 'Feedback type is required'),
  detailedFeedback:  z.string().min(1, 'Detailed feedback is required').max(2000),
  summaryOfFeedback: z.string().max(2000).optional(),
  visitId:           z.string().uuid().optional().or(z.literal('')),
  territoryId:       z.string().uuid().optional().or(z.literal('')),
  reviewedModule:    z.string().optional(),
  moduleProgressPct: z.coerce.number<number>().min(0).max(100).optional(),
  followUpRequired:  z.boolean().optional(),
  followUpDate:      z.string().optional(),
  dateProvided:      z.string().optional(),
})

export type CoachingNoteFormData = z.infer<typeof coachingNoteSchema>

export const coachingNoteEditSchema = z.object({
  noteTitle:         z.string().min(2, 'Title must be at least 2 characters').optional(),
  feedbackType:      z.string().optional(),
  detailedFeedback:  z.string().max(2000).optional(),
  summaryOfFeedback: z.string().max(2000).optional(),
  reviewedModule:    z.string().optional(),
  moduleProgressPct: z.coerce.number<number>().min(0).max(100).optional(),
  followUpRequired:  z.boolean().optional(),
  followUpDate:      z.string().optional(),
})

export type CoachingNoteEditFormData = z.infer<typeof coachingNoteEditSchema>
