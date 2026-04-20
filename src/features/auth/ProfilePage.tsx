import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, X, Check, Shield, User, GraduationCap, Users, MapPin, UserCheck } from 'lucide-react'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/hooks/useAuth'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useUpdateProfile, useChangePassword } from '@/api/endpoints/auth'
import { useMyProfile } from '@/api/endpoints/users'
import { useCoachingByRep } from '@/api/endpoints/coaching'
import { usePagination } from '@/hooks/usePagination'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormRow } from '@/components/shared/FormRow'
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
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
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

// ─── Teams & Territories ──────────────────────────────────────────────────────
function TeamsSection({ userId }: { userId: string }) {
  const { data: profile, isLoading } = useMyProfile()

  // Only render for the current user's own profile
  if (!userId) return null

  return (
    <Section title="Teams" icon={Users}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !profile?.teams?.length ? (
        <p className="text-sm text-muted-foreground">No team assigned yet.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          {profile.teams.map((team, i) => (
            <div key={team.teamId}>
              {i > 0 && <Separator />}
              <div className="px-4 py-3 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{team.teamName ?? '—'}</p>
                {team.administratorName && (
                  <p className="text-xs text-muted-foreground">Manager: {team.administratorName}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

function TerritoriesSection({ userId }: { userId: string }) {
  const { isManager } = useRole()
  const { data: profile, isLoading } = useMyProfile()

  if (!userId) return null

  // MANAGER sees territories they supervise; FIELD_REP sees territories they are assigned to
  const isManagerView = isManager
  const items = isManagerView ? (profile?.managedTerritories ?? []) : (profile?.territories ?? [])
  const emptyMessage = isManagerView ? 'No territories to manage yet.' : 'No territories assigned yet.'

  return (
    <Section title="Territories" icon={MapPin}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !items.length ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          {items.map((territory, i) => (
            <div key={territory.territoryId}>
              {i > 0 && <Separator />}
              <div className="px-4 py-3 space-y-0.5">
                <p className="text-sm font-medium text-foreground">
                  {territory.territoryName ?? '—'}
                  {territory.territoryCode && (
                    <span className="ml-2 text-xs text-muted-foreground tabular-nums">{territory.territoryCode}</span>
                  )}
                </p>
                {isManagerView
                  ? 'primaryRepName' in territory && territory.primaryRepName && (
                      <p className="text-xs text-muted-foreground">Primary Rep: {territory.primaryRepName}</p>
                    )
                  : 'managerName' in territory && territory.managerName && (
                      <p className="text-xs text-muted-foreground">Manager: {territory.managerName}</p>
                    )
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ─── Reporting Structure ──────────────────────────────────────────────────────
function ReportingStructureSection({ userId }: { userId: string }) {
  const { data: profile, isLoading } = useMyProfile()

  if (!userId) return null

  const reportsTo = profile?.reportsTo
  const directReports = profile?.directReports ?? []

  if (!isLoading && !reportsTo && directReports.length === 0) return null

  return (
    <Section title="Reporting Structure" icon={UserCheck}>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-4">
          {reportsTo && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Reports To</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-xs">
                    {(reportsTo.fullName ?? '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{reportsTo.fullName ?? '—'}</p>
                  {reportsTo.jobTitle && <p className="text-xs text-muted-foreground">{reportsTo.jobTitle}</p>}
                </div>
              </div>
            </div>
          )}

          {directReports.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Direct Reports ({directReports.length})</p>
              <div className="rounded-lg border overflow-hidden">
                {directReports.map((report, i) => (
                  <div key={report.userId}>
                    {i > 0 && <Separator />}
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-xs">
                          {(report.fullName ?? '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{report.fullName ?? '—'}</p>
                        {report.jobTitle && <p className="text-xs text-muted-foreground truncate">{report.jobTitle}</p>}
                      </div>
                      {report.role && <Badge variant="secondary" className="shrink-0">{formatLabel(report.role)}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
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
          <div className="rounded-lg border overflow-hidden">
            {notes.map((note, i) => (
              <div key={note.id}>
                {i > 0 && <Separator />}
                <button
                  onClick={() => navigate(`/coaching/${note.id}`)}
                  className="w-full flex items-start justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{note.noteTitle ?? '—'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {note.feedbackType ? formatLabel(note.feedbackType) : '—'}
                      {note.coachName ? ` · ${note.coachName}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-muted-foreground">{formatDate(note.dateProvided)}</p>
                    {note.followUpRequired && !note.followUpCompleted && (
                      <Badge className="mt-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
                        Follow-up pending
                      </Badge>
                    )}
                    {note.followUpRequired && note.followUpCompleted && (
                      <Badge className="mt-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                        Follow-up done
                      </Badge>
                    )}
                  </div>
                </button>
              </div>
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
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarFallback className="text-base font-semibold">
                  {(user?.fullName ?? '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{user?.fullName ?? '—'}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full Name" value={user?.fullName} />
              <Field label="Email" value={user?.email} />
              <Field label="Role" value={user?.roles[0] ? formatLabel(user.roles[0]) : undefined} />
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
              <FormRow label="First Name" fieldId="firstName" error={nameForm.formState.errors.firstName?.message}>
                <Input id="firstName" {...nameForm.register('firstName')} autoFocus />
              </FormRow>
              <FormRow label="Last Name" fieldId="lastName" error={nameForm.formState.errors.lastName?.message}>
                <Input id="lastName" {...nameForm.register('lastName')} />
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

      {/* Teams & Territories — from /me/profile, not cached with session */}
      {user?.userId && <TeamsSection userId={user.userId} />}
      {user?.userId && <TerritoriesSection userId={user.userId} />}
      {user?.userId && <ReportingStructureSection userId={user.userId} />}

      {/* Coaching History — visible to all roles */}
      {user?.userId && <CoachingHistorySection userId={user.userId} />}

      {/* Change Password */}
      <Section title="Security" icon={Shield}>
        <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormRow label="Current Password" fieldId="currentPassword" error={passwordForm.formState.errors.currentPassword?.message}>
              <Input id="currentPassword" {...passwordForm.register('currentPassword')} type="password" autoComplete="current-password" />
            </FormRow>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormRow label="New Password" fieldId="newPassword" error={passwordForm.formState.errors.newPassword?.message}>
              <Input id="newPassword" {...passwordForm.register('newPassword')} type="password" autoComplete="new-password" />
            </FormRow>
            <FormRow label="Confirm New Password" fieldId="confirmPassword" error={passwordForm.formState.errors.confirmPassword?.message}>
              <Input id="confirmPassword" {...passwordForm.register('confirmPassword')} type="password" autoComplete="new-password" />
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
