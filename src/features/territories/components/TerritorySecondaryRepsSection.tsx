import { useState } from 'react'
import { UserPlus, Trash2, Users } from 'lucide-react'
import { useTerritorySecondaryReps, useAddSecondaryRep, useRemoveSecondaryRep } from '@/api/endpoints/territories'
import { useStaffSearch } from '@/api/endpoints/users'
import { useRole } from '@/hooks/useRole'
import { useDebounce } from '@/hooks/useDebounce'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { formatDate } from '@/utils/formatters'
import type { SecondaryRepInfo } from '@/api/app-types'

interface TerritorySecondaryRepsSectionProps {
  territoryId: string
}

export function TerritorySecondaryRepsSection({ territoryId }: TerritorySecondaryRepsSectionProps) {
  const { isManager } = useRole()
  const { data: reps, isLoading } = useTerritorySecondaryReps(territoryId)
  const { mutate: addRep, isPending: isAdding } = useAddSecondaryRep(territoryId)
  const { mutate: removeRep, isPending: isRemoving } = useRemoveSecondaryRep(territoryId)

  const [showAdd, setShowAdd] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [repToRemove, setRepToRemove] = useState<SecondaryRepInfo | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)

  const { data: staffResults, isLoading: isSearching } = useStaffSearch(debouncedQuery)
  const staffOptions: ComboboxOption[] = (staffResults ?? []).map((u) => ({
    value: u.id!,
    label: u.fullName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
  }))

  function handleAdd() {
    if (!selectedUserId) return
    addRep(selectedUserId, {
      onSuccess: () => {
        toast('Secondary rep assigned', { variant: 'success' })
        setShowAdd(false)
        setSelectedUserId('')
        setSearchQuery('')
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Users className="h-3.5 w-3.5" strokeWidth={1.75} />
          Secondary Reps
        </h2>
        {isManager && !showAdd && (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Assign Rep
          </Button>
        )}
      </div>

      {showAdd && (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Combobox
              value={selectedUserId}
              onChange={setSelectedUserId}
              options={staffOptions}
              placeholder="Search staff…"
              searchPlaceholder="Type name…"
              onSearchChange={setSearchQuery}
              isLoading={isSearching}
            />
          </div>
          <Button size="sm" onClick={handleAdd} disabled={!selectedUserId || isAdding}>
            {isAdding ? 'Assigning…' : 'Assign'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setSelectedUserId(''); setSearchQuery('') }}>
            Cancel
          </Button>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : !reps || reps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No secondary reps assigned.</p>
      ) : (
        <ul className="divide-y">
          {reps.map((rep) => (
            <li key={rep.userId} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">{rep.userName ?? '—'}</p>
                {rep.assignedAt && (
                  <p className="text-xs text-muted-foreground">Assigned {formatDate(rep.assignedAt)}</p>
                )}
              </div>
              {isManager && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setRepToRemove(rep)}
                  disabled={isRemoving}
                  aria-label={`Remove ${rep.userName}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!repToRemove}
        onCancel={() => setRepToRemove(null)}
        onConfirm={() =>
          removeRep(repToRemove!.userId!, {
            onSuccess: () => {
              toast('Secondary rep removed', { variant: 'success' })
              setRepToRemove(null)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setRepToRemove(null)
            },
          })
        }
        title="Remove Secondary Rep?"
        description={`Remove ${repToRemove?.userName ?? 'this rep'} from this territory?`}
        confirmLabel="Remove"
        isPending={isRemoving}
      />
    </div>
  )
}
