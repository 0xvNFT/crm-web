import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus, MailCheck, UserX, UserCheck, Search } from 'lucide-react'
import {
  useStaff,
  useInviteStaff,
  useDeactivateStaff,
  useReactivateStaff,
  useResendInvite,
} from '@/api/endpoints/users'
import { usePagination } from '@/hooks/usePagination'
import { PageHeader } from '@/components/shared/PageHeader'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Pagination } from '@/components/shared/Pagination'
import { formatDate, formatLabel } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import type { User } from '@/api/app-types'
import { inviteStaffSchema, type InviteStaffFormData } from '@/schemas/admin'

// ─── Role label mapping ────────────────────────────────────────────────────────
// User.roles is Role[] where Role has a `name` field
function roleLabel(roleName: string | undefined) {
  if (!roleName) return '—'
  const map: Record<string, string> = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    FIELD_REP: 'Field Rep',
  }
  return map[roleName] ?? formatLabel(roleName)
}

// ─── Invite Dialog ─────────────────────────────────────────────────────────────
function InviteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mutate: invite, isPending } = useInviteStaff()
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<InviteStaffFormData>({
    resolver: zodResolver(inviteStaffSchema),
  })

  function onSubmit(data: InviteStaffFormData) {
    invite(data, {
      onSuccess: () => {
        toast('Invitation sent', { variant: 'success' })
        reset()
        onClose()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogDescription>
            An invite link will be emailed to the staff member. They'll use it to set their password and activate their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input {...register('firstName')} autoFocus />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input {...register('email')} type="email" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Role <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="FIELD_REP">Field Rep</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Job Title</Label>
              <Input {...register('jobTitle')} placeholder="e.g. Sales Rep" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Department</Label>
              <Input {...register('department')} placeholder="e.g. Field Force" />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Sending…' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { page, goToPage } = usePagination()
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [confirm, setConfirm] = useState<{ type: 'deactivate' | 'reactivate'; user: User } | null>(null)

  const { data, isLoading, isError } = useStaff(page)
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateStaff()
  const { mutate: reactivate, isPending: isReactivating } = useReactivateStaff()
  const { mutate: resendInvite } = useResendInvite()

  const users = data?.content ?? []

  // Client-side filter on loaded page — full search would need the search endpoint
  const filtered = search.trim()
    ? users.filter((u) => {
        const q = search.toLowerCase()
        return (
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.roles?.[0]?.name?.toLowerCase().includes(q)
        )
      })
    : users

  function handleConfirmAction() {
    if (!confirm) return
    const { type, user } = confirm
    if (!user.id) return

    if (type === 'deactivate') {
      deactivate(user.id, {
        onSuccess: () => { toast('Staff member deactivated', { variant: 'success' }); setConfirm(null) },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    } else {
      reactivate(user.id, {
        onSuccess: () => { toast('Staff member reactivated', { variant: 'success' }); setConfirm(null) },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    }
  }

  function handleResendInvite(user: User) {
    if (!user.id) return
    resendInvite(user.id, {
      onSuccess: () => toast('Invite resent', { variant: 'success' }),
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Team Management"
        description="Manage staff accounts, roles, and access"
        actions={
          <Button size="sm" onClick={() => setShowInvite(true)}>
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite Staff
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name, email, or role…"
          className="pl-8"
        />
      </div>

      {/* User table */}
      <div className="rounded-xl border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {search ? `No staff found for "${search}"` : 'No staff members yet.'}
                </td>
              </tr>
            )}
            {filtered.map((user) => {
              const isActive = user.status !== 'inactive'
              const isPendingInvite = !user.emailVerified

              return (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-foreground">{user.fullName ?? '—'}</p>
                      {user.jobTitle && <p className="text-xs text-muted-foreground">{user.jobTitle}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {roleLabel(user.roles?.[0]?.name)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {isPendingInvite ? (
                      <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Invite Pending
                      </span>
                    ) : (
                      <StatusBadge status={isActive ? 'ACTIVE' : 'INACTIVE'} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {isPendingInvite && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResendInvite(user)}
                          title="Resend invite"
                        >
                          <MailCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {!isPendingInvite && isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirm({ type: 'deactivate', user })}
                          className="text-destructive hover:text-destructive"
                          title="Deactivate"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {!isPendingInvite && !isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirm({ type: 'reactivate', user })}
                          className="text-primary hover:text-primary"
                          title="Reactivate"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />

      <InviteDialog open={showInvite} onClose={() => setShowInvite(false)} />

      <ConfirmDialog
        open={!!confirm}
        onCancel={() => setConfirm(null)}
        onConfirm={handleConfirmAction}
        title={confirm?.type === 'deactivate' ? 'Deactivate Staff Member?' : 'Reactivate Staff Member?'}
        description={
          confirm?.type === 'deactivate'
            ? `"${confirm.user.fullName ?? confirm.user.email}" will lose access immediately. Their data is preserved.`
            : `"${confirm?.user.fullName ?? confirm?.user.email}" will be able to log in again.`
        }
        confirmLabel={confirm?.type === 'deactivate' ? 'Deactivate' : 'Reactivate'}
        isPending={isDeactivating || isReactivating}
      />
    </div>
  )
}
