import { z } from 'zod'
import { emailRequired } from './primitives'

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.#-])[A-Za-z\d@$!%*?&_.#-]{8,128}$/
const PASSWORD_MESSAGE = 'Password must be 8–128 characters with at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&_.#-)'

export const loginSchema = z.object({
  email: emailRequired,
  // min(8) mirrors the backend minimum — prevents sending obviously invalid passwords
  // Full complexity rules are NOT applied here (login ≠ registration)
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    tenantName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(255),
    tenantSlug: z
      .string()
      .trim()
      .min(2, 'Slug must be at least 2 characters')
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: emailRequired,
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type RegisterFormData = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: emailRequired,
})
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const acceptInviteSchema = z
  .object({
    password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>

export const profileNameSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})
export type ProfileNameFormData = z.infer<typeof profileNameSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
