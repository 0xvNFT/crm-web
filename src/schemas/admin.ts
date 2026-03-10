import { z } from 'zod'

// Used by AdminPage — invite staff member
export const inviteStaffSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  role: z.enum(['ADMIN', 'MANAGER', 'FIELD_REP'], { error: 'Role is required' }),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
})
export type InviteStaffFormData = z.infer<typeof inviteStaffSchema>
