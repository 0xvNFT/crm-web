import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, X, Check, Shield, User, GraduationCap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateProfile, useChangePassword } from '@/api/endpoints/auth'
import { useCoachingByRep } from '@/api/endpoints/coaching'
import { usePagination } from '@/hooks/usePagination'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { formatDate, formatLabel } from '@/utils/formatters'
import {
  profileNameSchema, type ProfileNameFormData,
  changePasswordSchema, type ChangePasswordFormData,
} from '@/schemas/auth'

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

// ─── Coaching History ─────────────────────────────────────────────────────────
function CoachingHistorySection({ userId }: { userId: string }) {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useCoachingByRep(userId, page, 10)
  const notes = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <Section title="Coaching History" icon={GraduationCap}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No coaching notes yet.</p>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border divide-y overflow-hidden">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => navigate(`/coaching/${note.id}`)}
                className="w-full flex items-start justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{note.noteTitle ?? '—'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {note.feedbackType ? formatLabel(note.feedbackType) : '—'}
                    {note.coach?.fullName ? ` · ${note.coach.fullName}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-muted-foreground">{formatDate(note.dateProvided)}</p>
                  {note.followUpRequired && !note.followUpCompleted && (
                    <span className="text-xs text-amber-600 font-medium">Follow-up pending</span>
                  )}
                  {note.followUpRequired && note.followUpCompleted && (
                    <span className="text-xs text-green-600 font-medium">Follow-up done</span>
                  )}
                </div>
              </button>
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          )}
        </div>
      )}
    </Section>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, login } = useAuth()
  const [editingName, setEditingName] = useState(false)

  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword()

  // ── Name form ──
  const nameForm = useForm<ProfileNameFormData>({
    resolver: zodResolver(profileNameSchema),
  })

  function startEditName() {
    const [firstName = '', ...rest] = (user?.fullName ?? '').split(' ')
    const lastName = rest.join(' ')
    nameForm.reset({ firstName, lastName })
    setEditingName(true)
  }

  function onSubmitName(data: ProfileNameFormData) {
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
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  function onSubmitPassword(data: ChangePasswordFormData) {
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

      {/* Coaching History — visible to all roles */}
      {user?.userId && <CoachingHistorySection userId={user.userId} />}

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
