import { z } from 'zod'

// Used by ContactFormPage (create)
export const contactSchema = z.object({
  accountId: z.string().min(1, 'Primary account is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactType: z.string().min(1, 'Contact type is required'),
  salutation: z.string().optional(),
  middleName: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  specialty: z.string().optional(),
  customerClass: z.string().optional(),
  adoptionStage: z.string().optional(),
  prescribingAuthority: z.boolean().optional(),
  prcNumber: z.string().optional(),
  leadSource: z.string().optional(),
  consentConfirmedStatus: z.string().optional(),
  consentConfirmedDate: z.string().optional(),
  addressStreet: z.string().optional(),
  addressBarangay: z.string().optional(),
  addressCity: z.string().optional(),
  addressProvince: z.string().optional(),
  addressPostalCode: z.string().optional(),
  notes: z.string().optional(),
})
export type ContactFormData = z.infer<typeof contactSchema>

// Used by ContactDetailPage (inline edit)
// Note: account cannot be changed via update — use /affiliations endpoint instead
export const contactEditSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  contactType: z.string().min(1, 'Contact type is required'),
  specialty: z.string().optional(),
  npiNumber: z.string().optional(),
  deaNumber: z.string().optional(),
  stateLicenseNumber: z.string().optional(),
  prescribingAuthority: z.boolean().optional(),
  yearsOfExperience: z.coerce.number<number>().int().nonnegative().optional(),
  patientVolumeMonthly: z.coerce.number<number>().int().nonnegative().optional(),
  preferredContactMethod: z.string().optional(),
  preferredContactTime: z.string().optional(),
  status: z.string().optional(),
  consentConfirmedStatus: z.string().optional(),
  consentConfirmedDate: z.string().optional(),
  notes: z.string().optional(),
})
export type ContactEditFormData = z.infer<typeof contactEditSchema>

// Used by ContactAffiliationsSection (add affiliation dialog)
export const affiliationSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  isPrimary: z.boolean().optional(),
  positionTitle: z.string().optional(),
  department: z.string().optional(),
  availableHours: z.string().optional(),
  consultationFee: z.coerce.number<number>().nonnegative('Must be 0 or greater').optional(),
  effectiveTo: z.string().optional(),
  notes: z.string().optional(),
})
export type AffiliationFormData = z.infer<typeof affiliationSchema>
