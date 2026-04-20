import { MailCheck, UserX, UserCheck, Pencil } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatDate, formatLabel } from '@/utils/formatters'
import type { StaffMember } from '@/api/app-types'

function roleLabel(roleName: string | undefined) {
  if (!roleName) return '—'
  const map: Record<string, string> = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    FIELD_REP: 'Field Rep',
  }
  return map[roleName] ?? formatLabel(roleName)
}

interface StaffTableProps {
  users: StaffMember[]
  emptyMessage: string
  isAdmin: boolean
  currentUserId?: string
  onEdit: (user: StaffMember) => void
  onDeactivate: (user: StaffMember) => void
  onReactivate: (user: StaffMember) => void
  onResendInvite: (user: StaffMember) => void
}

export function StaffTable({
  users,
  emptyMessage,
  isAdmin,
  currentUserId,
  onEdit,
  onDeactivate,
  onReactivate,
  onResendInvite,
}: StaffTableProps) {
  return (
    <div className="overflow-x-auto">
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
          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          )}
          {users.map((user) => {
            const isActive        = user.status !== 'inactive'
            const isPendingInvite = !user.emailVerified
            const isSelf          = user.id === currentUserId

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
                    {roleLabel(user.role)}
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
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(user)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </Button>
                    )}
                    {isAdmin && isPendingInvite && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResendInvite(user)}
                        aria-label="Resend invite"
                      >
                        <MailCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </Button>
                    )}
                    {isAdmin && !isPendingInvite && isActive && (
                      isSelf ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="text-destructive hover:text-destructive pointer-events-auto"
                              aria-label="Deactivate"
                              aria-disabled="true"
                            >
                              <UserX className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>You cannot deactivate your own account</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeactivate(user)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Deactivate"
                        >
                          <UserX className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Button>
                      )
                    )}
                    {isAdmin && !isPendingInvite && !isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReactivate(user)}
                        className="text-primary hover:text-primary"
                        aria-label="Reactivate"
                      >
                        <UserCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
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
  )
}
