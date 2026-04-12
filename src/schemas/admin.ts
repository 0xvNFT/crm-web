import { z } from 'zod'
import { emailRequired, phoneField } from './primitives'

// Used by AdminPage — invite staff member
export const inviteStaffSchema = z.object({
  firstName:  z.string().trim().min(1, 'First name is required'),
  lastName:   z.string().trim().min(1, 'Last name is required'),
  email:      emailRequired,
  role:       z.string().min(1, 'Role is required'),
  jobTitle:   z.string().trim().optional(),
  department: z.string().trim().optional(),
})
export type InviteStaffFormData = z.infer<typeof inviteStaffSchema>

// Used by AdminPage — edit staff role/profile
export const editStaffSchema = z.object({
  role:         z.string().optional(),
  firstName:    z.string().trim().min(1, 'First name is required'),
  lastName:     z.string().trim().min(1, 'Last name is required'),
  jobTitle:     z.string().trim().optional(),
  department:   z.string().trim().optional(),
  phoneWork:    phoneField,
  phoneMobile:  phoneField,
  // Reports To — mutually exclusive: send managerId OR clearManager, never both
  managerId:    z.string().optional(),
  clearManager: z.boolean().optional(),
})
export type EditStaffFormData = z.infer<typeof editStaffSchema>
