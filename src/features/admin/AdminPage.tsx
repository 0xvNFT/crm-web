import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import {
  useStaff,
  useStaffSearch,
  useDeactivateStaff,
  useReactivateStaff,
  useResendInvite,
} from '@/api/endpoints/users'
import { useListParams } from '@/hooks/useListParams'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/hooks/useAuth'
import { PageHeader } from '@/components/shared/PageHeader'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/shared/Pagination'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { StaffMember } from '@/api/app-types'
import { InviteDialog } from './components/InviteDialog'
import { EditStaffDialog } from './components/EditStaffDialog'
import { StaffTable } from './components/StaffTable'

type ConfirmAction = { type: 'deactivate' | 'reactivate'; user: StaffMember }

export default function AdminPage() {
  const { isAdmin } = useRole()
  const { user: currentUser } = useAuth()
  const { page, goToPage } = useListParams([])
  const [query, setQuery]           = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [editUser, setEditUser]     = useState<StaffMember | null>(null)
  const [confirm, setConfirm]       = useState<ConfirmAction | null>(null)

  const debouncedQuery = useDebounce(query, 300)
  const isSearching    = debouncedQuery.trim().length >= 2

  const listQuery   = useStaff(page)
  const searchQuery = useStaffSearch(debouncedQuery)

  const { mutate: deactivate,  isPending: isDeactivating } = useDeactivateStaff()
  const { mutate: reactivate,  isPending: isReactivating } = useReactivateStaff()
  const { mutate: resendInvite                           } = useResendInvite()

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError   = isSearching ? searchQuery.isError   : listQuery.isError
  const error     = isSearching ? searchQuery.error     : listQuery.error
  const users: StaffMember[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])

  function handleConfirmAction() {
    if (!confirm?.user.id) return
    const { type, user } = confirm

    if (type === 'deactivate') {
      deactivate(user.id!, {
        onSuccess: () => { toast('Staff member deactivated', { variant: 'success' }); setConfirm(null) },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    } else {
      reactivate(user.id!, {
        onSuccess: () => { toast('Staff member reactivated', { variant: 'success' }); setConfirm(null) },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    }
  }

  function handleResendInvite(user: StaffMember) {
    if (!user.id) return
    resendInvite(user.id, {
      onSuccess: () => toast('Invite resent', { variant: 'success' }),
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Team Management"
        description="Manage staff accounts, roles, and access"
        actions={
          isAdmin && (
            <Button size="sm" onClick={() => setShowInvite(true)}>
              <UserPlus className="h-4 w-4 mr-1.5" />
              Invite Staff
            </Button>
          )
        }
      />

      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-3">
          <SearchInput
            value={query}
            onChange={(v) => { setQuery(v); goToPage(0) }}
            placeholder="Search by name or email…"
            className="w-60 shrink-0"
          />
          {!isSearching && listQuery.data?.totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {listQuery.data.totalElements.toLocaleString()} {listQuery.data.totalElements === 1 ? 'member' : 'members'}
            </span>
          )}
        </div>

        <StaffTable
          users={users}
          emptyMessage={isSearching ? `No staff found for "${debouncedQuery}"` : 'No staff members yet.'}
          isAdmin={isAdmin}
          currentUserId={currentUser?.userId}
          onEdit={setEditUser}
          onDeactivate={(user) => setConfirm({ type: 'deactivate', user })}
          onReactivate={(user) => setConfirm({ type: 'reactivate', user })}
          onResendInvite={handleResendInvite}
        />

        {!isSearching && (listQuery.data?.totalPages ?? 0) > 1 && (
          <div className="border-t border-border/40 px-4">
            <Pagination page={page} totalPages={listQuery.data?.totalPages ?? 0} onChange={goToPage} />
          </div>
        )}
      </div>

      <InviteDialog open={showInvite} onClose={() => setShowInvite(false)} />

      <EditStaffDialog key={editUser?.id} user={editUser} onClose={() => setEditUser(null)} />

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
