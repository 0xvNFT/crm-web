import { z } from 'zod'
import { phoneField, emailField, nameField, notesField, countField, dateField } from './primitives'

// Used by ContactFormPage (create)
export const contactSchema = z.object({
  accountId: z.string().min(1, 'Primary account is required'),
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  contactType: z.string().min(1, 'Contact type is required'),
  salutation: z.string().optional(),
  middleName: z.string().trim().optional(),
  title: z.string().trim().optional(),
  email: emailField,
  phone: phoneField,
  mobile: phoneField,
  specialty: z.string().trim().optional(),
  customerClass: z.string().optional(),
  customerType: z.string().optional(),
  adoptionStage: z.string().optional(),
  prescribingAuthority: z.boolean().optional(),
  prcNumber: z.string().trim().optional(),
  npiNumber: z.string().trim().optional(),
  deaNumber: z.string().trim().optional(),
  stateLicenseNumber: z.string().trim().optional(),
  preferredContactMethod: z.string().trim().optional(),
  preferredContactTime: z.string().trim().optional(),
  leadSource: z.string().optional(),
  status: z.string().optional(),
  consentConfirmedStatus: z.string().optional(),
  consentConfirmedDate: dateField,
  addressStreet: z.string().trim().optional(),
  addressRegion: z.string().optional(),
  addressProvince: z.string().optional(),
  addressCity: z.string().optional(),
  addressBarangay: z.string().optional(),
  addressPostalCode: z.string().trim().optional(),
  notes: notesField,
})
export type ContactFormData = z.infer<typeof contactSchema>

// Used by ContactDetailPage (inline edit)
// Note: accountId cannot be changed via update — use /affiliations endpoint instead
export const contactEditSchema = z.object({
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  title: z.string().trim().optional(),
  email: emailField,
  phone: phoneField,
  mobile: phoneField,
  contactType: z.string().min(1, 'Contact type is required'),
  specialty: z.string().trim().optional(),
  customerClass: z.string().optional(),
  customerType: z.string().optional(),
  adoptionStage: z.string().optional(),
  leadSource: z.string().optional(),
  professionalSociety: z.string().trim().optional(),
  npiNumber: z.string().trim().optional(),
  deaNumber: z.string().trim().optional(),
  stateLicenseNumber: z.string().trim().optional(),
  prcNumber: z.string().trim().optional(),
  prcExpiryDate: dateField,
  prescribingAuthority: z.boolean().optional(),
  doNotCall: z.boolean().optional(),
  emailOptOut: z.boolean().optional(),
  yearsOfExperience: countField,
  patientVolumeMonthly: countField,
  preferredContactMethod: z.string().trim().optional(),
  preferredContactTime: z.string().trim().optional(),
  status: z.string().optional(),
  consentConfirmedStatus: z.string().optional(),
  consentConfirmedDate: dateField,
  addressStreet: z.string().trim().optional(),
  addressRegion: z.string().optional(),
  addressProvince: z.string().optional(),
  addressCity: z.string().optional(),
  addressBarangay: z.string().optional(),
  addressPostalCode: z.string().trim().optional(),
  notes: notesField,
})
export type ContactEditFormData = z.infer<typeof contactEditSchema>

// Used by ContactAffiliationsSection (add affiliation dialog)
export const affiliationSchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  isPrimary: z.boolean().optional(),
  positionTitle: z.string().trim().optional(),
  department: z.string().trim().optional(),
  availableHours: z.string().trim().optional(),
  consultationFee: z.coerce.number<number>().nonnegative('Must be 0 or greater').optional(),
  effectiveTo: dateField,
  notes: notesField,
})
export type AffiliationFormData = z.infer<typeof affiliationSchema>
