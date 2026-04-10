import { z } from 'zod'
import { dateField } from './primitives'

export const coachingNoteSchema = z.object({
  coachId:           z.uuid('Invalid coach'),
  repId:             z.uuid('Invalid rep'),
  noteTitle:         z.string().trim().min(2, 'Title must be at least 2 characters'),
  feedbackType:      z.string().min(1, 'Feedback type is required'),
  detailedFeedback:  z.string().trim().min(1, 'Detailed feedback is required').max(2000),
  summaryOfFeedback: z.string().max(2000).optional(),
  visitId:           z.uuid().optional().or(z.literal('')),
  territoryId:       z.uuid().optional().or(z.literal('')),
  reviewedModule:    z.string().optional(),
  moduleProgressPct: z.coerce.number<number>().min(0).max(100).optional(),
  followUpRequired:  z.boolean().optional(),
  followUpDate:      dateField,
  dateProvided:      dateField,
})

export type CoachingNoteFormData = z.infer<typeof coachingNoteSchema>

export const coachingNoteEditSchema = z.object({
  noteTitle:         z.string().trim().min(2, 'Title must be at least 2 characters').optional(),
  feedbackType:      z.string().optional(),
  detailedFeedback:  z.string().max(2000).optional(),
  summaryOfFeedback: z.string().max(2000).optional(),
  reviewedModule:    z.string().optional(),
  moduleProgressPct: z.coerce.number<number>().min(0).max(100).optional(),
  followUpRequired:  z.boolean().optional(),
  followUpDate:      dateField,
})

export type CoachingNoteEditFormData = z.infer<typeof coachingNoteEditSchema>
