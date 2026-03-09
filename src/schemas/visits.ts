import { z } from 'zod'

export const scheduleVisitSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  contactId: z.string().optional(),
  territoryId: z.string().optional(),
  subject: z.string().min(1, 'Subject is required').max(255),
  visitType: z.string().min(1, 'Visit type is required'),
  scheduledStart: z.string().min(1, 'Start date/time is required'),
  scheduledEnd: z.string().min(1, 'End date/time is required'),
  callObjectives: z.string().optional(),
  notes: z.string().optional(),
})
export type ScheduleVisitFormData = z.infer<typeof scheduleVisitSchema>

export const checkOutSchema = z.object({
  outcome: z.string().min(1, 'Outcome is required'),
  keyDiscussionPoints: z.string().optional(),
  customerFeedback: z.string().optional(),
})
export type CheckOutFormData = z.infer<typeof checkOutSchema>

export const rejectVisitSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
})
export type RejectVisitFormData = z.infer<typeof rejectVisitSchema>
