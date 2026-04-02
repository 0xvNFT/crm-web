import { z } from 'zod'

// Used by AdminPage — invite staff member
export const inviteStaffSchema = z.object({
  firstName:  z.string().min(1, 'First name is required'),
  lastName:   z.string().min(1, 'Last name is required'),
  email:      z.string().email('Enter a valid email'),
  role:       z.enum(['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY', 'CSR'], { error: 'Role is required' }),
  jobTitle:   z.string().optional(),
  department: z.string().optional(),
})
export type InviteStaffFormData = z.infer<typeof inviteStaffSchema>

// Used by AdminPage — edit staff role/profile
export const editStaffSchema = z.object({
  role:        z.enum(['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY', 'CSR']).optional(),
  firstName:   z.string().min(1, 'First name is required'),
  lastName:    z.string().min(1, 'Last name is required'),
  jobTitle:    z.string().optional(),
  department:  z.string().optional(),
  phoneWork:   z.string().optional(),
  phoneMobile: z.string().optional(),
})
export type EditStaffFormData = z.infer<typeof editStaffSchema>
