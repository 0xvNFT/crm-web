import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, UserPlus, Users2 } from 'lucide-react'
import { useTeam, useTeamMembers, useDeactivateTeam, useReactivateTeam, useAddTeamMember, useRemoveTeamMember } from '@/api/endpoints/teams'
import { useStaffSearch } from '@/api/endpoints/users'
import { useRole } from '@/hooks/useRole'
import { useDebounce } from '@/hooks/useDebounce'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import type { TenantUserSummary } from '@/api/app-types'

// ─── Sub-components ────────────────────────────────────────────────────────────
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : String(value)

  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  )
}

function ActiveBadge({ isActive }: { isActive?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        isActive
          ? 'bg-green-100 text-green-800 border-green-200'
          : 'bg-red-100 text-red-800 border-red-200'
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useRole()

  const [showDeactivate, setShowDeactivate] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<TenantUserSummary | null>(null)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [showReactivate, setShowReactivate] = useState(false)

  const debouncedQuery = useDebounce(userQuery, 300)

  const { data: team, isLoading, isError } = useTeam(id ?? '')
  const { data: members, isLoading: isLoadingMembers } = useTeamMembers(id ?? '')
  const { data: userResults, isFetching: isSearching } = useStaffSearch(debouncedQuery)
  const { mutate: deactivateTeam, isPending: isDeactivating } = useDeactivateTeam(id ?? '')
  const { mutate: reactivateTeam, isPending: isReactivating } = useReactivateTeam(id ?? '')
  const { mutate: addMember, isPending: isAddingMember } = useAddTeamMember(id ?? '')
  const { mutate: removeMember, isPending: isRemovingMember } = useRemoveTeamMember(id ?? '')

  if (isLoading) return <LoadingSpinner />
  if (isError || !team) return <ErrorMessage message="Team not found." />

  function handleSelectUser(user: TenantUserSummary) {
    setSelectedUser(user)
    setUserQuery(`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim())
  }

  function handleAddMember() {
    if (!selectedUser?.id) return
    addMember(selectedUser.id, {
      onSuccess: () => {
        toast('Member added', { variant: 'success' })
        setSelectedUser(null)
        setUserQuery('')
        setShowAddMember(false)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  function handleCancelAddMember() {
    setShowAddMember(false)
    setSelectedUser(null)
    setUserQuery('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{team.name}</h1>
            <ActiveBadge isActive={team.isActive} />
          </div>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {team.teamType && <span>{team.teamType}</span>}
            {team.administrator?.fullName && (
              <>
                {team.teamType && <span>·</span>}
                <span>{team.administrator.fullName}</span>
              </>
            )}
          </div>
        </div>

        {isManager && (
          <div className="flex items-center gap-2 shrink-0">
            {team.isActive && (
              <Button variant="outline" size="sm" onClick={() => setShowAddMember((v) => !v)}>
                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                Add Member
              </Button>
            )}
            {team.isActive ? (
              <Button variant="destructive" size="sm" onClick={() => setShowDeactivate(true)}>
                Deactivate
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowReactivate(true)}>
                Reactivate
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Member inline form */}
      {showAddMember && isManager && (
        <div className="rounded-xl border bg-background p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Add Member</h2>
          <div className="max-w-md space-y-2">
            <div className="relative">
              <Input
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value)
                  setSelectedUser(null)
                }}
                placeholder="Search by name or email…"
                autoFocus
              />
              {/* Dropdown results */}
              {debouncedQuery.length >= 2 && !selectedUser && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-md">
                  {isSearching ? (
                    <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>
                  ) : userResults?.length ? (
                    userResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
                        onClick={() => handleSelectUser(user)}
                      >
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                        <span className="text-muted-foreground">{user.email}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-xs text-muted-foreground">No users found.</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddMember} disabled={isAddingMember || !selectedUser}>
                {isAddingMember ? 'Adding…' : 'Add Member'}
              </Button>
              <Button variant="outline" onClick={handleCancelAddMember}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Team Info */}
      <DetailSection title="Team Info">
        <DetailField label="Name" value={team.name} />
        <DetailField label="Type" value={team.teamType} />
        <DetailField label="Email" value={team.emailAddress} />
        <DetailField label="Administrator" value={team.administrator?.fullName} />
        <DetailField label="Created" value={formatDate(team.createdAt)} />
        <DetailField label="Last Updated" value={formatDate(team.updatedAt)} />
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <ActiveBadge isActive={team.isActive} />
        </div>
        {team.description && (
          <div className="sm:col-span-2 space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Description</p>
            <p className="text-sm text-foreground">{team.description}</p>
          </div>
        )}
      </DetailSection>

      {/* Members sub-section */}
      <div className="rounded-xl border bg-background p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Members</h2>
        {isLoadingMembers ? (
          <LoadingSpinner />
        ) : !members?.length ? (
          <EmptyState
            icon={Users2}
            title="No members yet"
            description="Add team members using the button above."
          />
        ) : (
          <div className="divide-y rounded-lg border">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  {member.jobTitle && (
                    <p className="text-xs text-muted-foreground">{member.jobTitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{formatDate(member.joinedAt)}</span>
                  {isManager && team.isActive && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setRemovingUserId(member.userId)}
                      aria-label="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deactivate confirm dialog */}
      <ConfirmDialog
        open={showDeactivate}
        onCancel={() => setShowDeactivate(false)}
        onConfirm={() =>
          deactivateTeam(undefined, {
            onSuccess: () => {
              toast('Team deactivated', { variant: 'success' })
              setShowDeactivate(false)
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Deactivate Team?"
        description="This will deactivate the team and prevent new assignments. Members are not removed."
        confirmLabel="Deactivate"
        isPending={isDeactivating}
      />

      {/* Reactivate confirm dialog */}
      <ConfirmDialog
        open={showReactivate}
        onCancel={() => setShowReactivate(false)}
        onConfirm={() =>
          reactivateTeam(undefined, {
            onSuccess: () => {
              toast('Team reactivated', { variant: 'success' })
              setShowReactivate(false)
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Reactivate Team?"
        description="This will reactivate the team and allow new assignments."
        confirmLabel="Reactivate"
        isPending={isReactivating}
      />

      {/* Remove member confirm dialog */}
      <ConfirmDialog
        open={removingUserId !== null}
        onCancel={() => setRemovingUserId(null)}
        onConfirm={() => {
          if (!removingUserId) return
          removeMember(removingUserId, {
            onSuccess: () => {
              toast('Member removed', { variant: 'success' })
              setRemovingUserId(null)
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }}
        title="Remove Member?"
        description="This will remove the member from the team. They can be re-added later."
        confirmLabel="Remove"
        isPending={isRemovingMember}
      />
    </div>
  )
}
