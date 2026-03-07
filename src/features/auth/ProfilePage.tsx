import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, X, Check, Shield, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile, useChangePassword } from '@/api/endpoints/auth'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.#\-])[A-Za-z\d@$!%*?&_.#\-]{8,128}$/

// ─── Schemas ──────────────────────────────────────────────────────────────────
const nameSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().regex(PASSWORD_REGEX, 'Password must be 8–128 chars with uppercase, lowercase, number, and special character'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type NameFormData = z.infer<typeof nameSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

// ─── Sub-components ────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value ?? '—'}</p>
    </div>
  )
}

function FormRow({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, login } = useAuth()
  const [editingName, setEditingName] = useState(false)

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword()

  // ── Name form ──
  const nameForm = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
  })

  function startEditName() {
    const [firstName = '', ...rest] = (user?.fullName ?? '').split(' ')
    const lastName = rest.join(' ')
    nameForm.reset({ firstName, lastName })
    setEditingName(true)
  }

  function onSubmitName(data: NameFormData) {
    updateProfile(data, {
      onSuccess: () => {
        // Optimistically update AuthContext so TopNav reflects new name immediately
        if (user) login({ ...user, fullName: `${data.firstName} ${data.lastName}` })
        toast('Profile updated', { variant: 'success' })
        setEditingName(false)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  // ── Password form ──
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  function onSubmitPassword(data: PasswordFormData) {
    changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }, {
      onSuccess: () => {
        toast('Password changed successfully', { variant: 'success' })
        passwordForm.reset()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <PageHeader title="Profile" description="Manage your account information and security settings" />

      {/* Profile Info */}
      <Section title="Profile Information" icon={User}>
        {!editingName ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full Name" value={user?.fullName} />
              <Field label="Email" value={user?.email} />
              <Field label="Role" value={user?.roles[0]} />
              <Field label="Tenant ID" value={user?.tenantId} />
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={startEditName}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit Name
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={nameForm.handleSubmit(onSubmitName)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="First Name" error={nameForm.formState.errors.firstName?.message}>
                <Input {...nameForm.register('firstName')} autoFocus />
              </FormRow>
              <FormRow label="Last Name" error={nameForm.formState.errors.lastName?.message}>
                <Input {...nameForm.register('lastName')} />
              </FormRow>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={isUpdating}>
                <Check className="h-3.5 w-3.5 mr-1.5" />
                {isUpdating ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingName(false)} disabled={isUpdating}>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Section>

      {/* Change Password */}
      <Section title="Security" icon={Shield}>
        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormRow label="Current Password" error={passwordForm.formState.errors.currentPassword?.message}>
              <Input {...passwordForm.register('currentPassword')} type="password" autoComplete="current-password" />
            </FormRow>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormRow label="New Password" error={passwordForm.formState.errors.newPassword?.message}>
              <Input {...passwordForm.register('newPassword')} type="password" autoComplete="new-password" />
            </FormRow>
            <FormRow label="Confirm New Password" error={passwordForm.formState.errors.confirmPassword?.message}>
              <Input {...passwordForm.register('confirmPassword')} type="password" autoComplete="new-password" />
            </FormRow>
          </div>
          <p className="text-xs text-muted-foreground">
            8–128 characters. Must include uppercase, lowercase, number, and special character (@$!%*?&_.#-).
          </p>
          <Button type="submit" size="sm" disabled={isChangingPassword}>
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            {isChangingPassword ? 'Changing…' : 'Change Password'}
          </Button>
        </form>
      </Section>
    </div>
  )
}
