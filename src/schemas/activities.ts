import { z } from 'zod'
import { dateField, notesField } from './primitives'

export const activitySchema = z.object({
  subject:          z.string().trim().min(1, 'Subject is required'),
  activityType:     z.string().min(1, 'Type is required'),
  assignedUserId:   z.string().min(1, 'Owner is required'),
  status:           z.string().optional(),
  priority:         z.string().optional(),
  dueDate:          dateField,
  durationMinutes:  z.coerce.number<number>().int().min(0).optional(),
  outcome:          z.string().trim().optional(),
  followUpRequired: z.boolean().optional(),
  followUpDate:     dateField,
  followUpNotes:    notesField,
  description:      notesField,
  // Entity linking — optional, set by context (e.g. creating from an account detail page)
  accountId:        z.string().optional(),
  contactId:        z.string().optional(),
  leadId:           z.string().optional(),
  opportunityId:    z.string().optional(),
  // Call-specific — only relevant when activityType = 'call'
  direction:        z.string().optional(),
  phoneNumber:      z.string().trim().optional(),
  leftVoiceMail:    z.boolean().optional(),
  callResult:       z.string().optional(),
  // Additional
  location:         z.string().trim().optional(),
  isPrivate:        z.boolean().optional(),
  startDateTime:    z.string().optional(),
})

export type ActivityFormData = z.infer<typeof activitySchema>
