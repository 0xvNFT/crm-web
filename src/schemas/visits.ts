import { z } from 'zod'
import { notesField } from './primitives'

export const scheduleVisitSchema = z.object({
  accountId:      z.string().min(1, 'Account is required'),
  contactId:      z.string().optional(),
  territoryId:    z.string().optional(),
  opportunityId:  z.string().optional(),
  subject:        z.string().trim().min(1, 'Subject is required').max(255),
  visitType:      z.string().min(1, 'Visit type is required'),
  scheduledStart: z.string().min(1, 'Start date/time is required'),
  scheduledEnd:   z.string().optional(),
  callObjectives: notesField,
  notes:          notesField,
})
export type ScheduleVisitFormData = z.infer<typeof scheduleVisitSchema>

export const checkOutSchema = z.object({
  outcome:            z.string().min(1, 'Outcome is required'),
  keyDiscussionPoints: notesField,
  customerFeedback:   notesField,
})
export type CheckOutFormData = z.infer<typeof checkOutSchema>

export const rejectVisitSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
})
export type RejectVisitFormData = z.infer<typeof rejectVisitSchema>

// Inline edit on VisitDetailPage — scheduled visits only
export const visitEditSchema = z.object({
  subject:          z.string().trim().min(1, 'Subject is required').max(255),
  locationName:     z.string().trim().optional(),
  visitType:        z.string().min(1, 'Visit type is required'),
  priority:         z.string().optional(),
  sentiment:        z.string().optional(),
  scheduledStart:   z.string().min(1, 'Start date/time is required'),
  scheduledEnd:     z.string().optional(),
  callObjectives:   notesField,
  notes:            notesField,
  opportunityId:    z.string().optional(),
  clearOpportunity: z.boolean().optional(),
})
export type VisitEditFormData = z.infer<typeof visitEditSchema>
