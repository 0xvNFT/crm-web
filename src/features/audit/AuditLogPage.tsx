/**
 * AuditLogPage — tenant-wide activity log for ADMIN/MANAGER.
 *
 * Industry standard: Salesforce/Veeva "Setup Audit Trail" style.
 * Shows who changed what across the entire tenant, filterable by
 * action type and entity type. Paginated, URL-persistent filters.
 *
 * Route: /audit  (ADMIN/MANAGER only — protected by RoleRoute)
 */
import { ShieldCheck } from 'lucide-react'
import { useAuditLog } from '@/api/endpoints/audit'
import { useListParams } from '@/hooks/useListParams'
import { PageHeader } from '@/components/shared/PageHeader'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { AuditActionBadge } from '@/components/shared/AuditActionBadge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/utils/formatters'
import type { AuditEvent } from '@/api/app-types'

// ─── Human-readable entity type labels ────────────────────────────────────────
const ENTITY_LABELS: Record<string, string> = {
  PharmaAccount:      'Account',
  PharmaContact:      'Contact',
  PharmaLead:         'Lead',
  PharmaOpportunity:  'Opportunity',
  PharmaOrder:        'Order',
  PharmaInvoice:      'Invoice',
  PharmaProduct:      'Product',
  PharmaMaterial:     'Material',
  PharmaActivity:     'Activity',
  PharmaFieldVisit:   'Visit',
  PharmaCoachingNote: 'Coaching Note',
}

function EntityTypeLabel({ entityType }: { entityType?: string }) {
  if (!entityType) return <span className="text-muted-foreground">—</span>
  return (
    <span className="text-sm text-foreground">
      {ENTITY_LABELS[entityType] ?? entityType}
    </span>
  )
}

// ─── Filter options ───────────────────────────────────────────────────────────
const ACTION_OPTIONS = [
  { value: 'CREATE',  label: 'Create' },
  { value: 'UPDATE',  label: 'Update' },
  { value: 'DELETE',  label: 'Delete' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT',  label: 'Reject' },
  { value: 'SUBMIT',  label: 'Submit' },
  { value: 'CANCEL',  label: 'Cancel' },
  { value: 'SHIP',    label: 'Ship' },
  { value: 'DELIVER', label: 'Deliver' },
  { value: 'VOID',    label: 'Void' },
]

const ENTITY_TYPE_OPTIONS = Object.entries(ENTITY_LABELS).map(([value, label]) => ({ value, label }))

const FILTER_KEYS = ['action', 'entityType']

// ─── Row ──────────────────────────────────────────────────────────────────────
function AuditRow({ event }: { event: AuditEvent }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3 whitespace-nowrap">
        <AuditActionBadge action={event.action ?? 'CHANGE'} nowrap />
      </td>
      <td className="px-4 py-3">
        <EntityTypeLabel entityType={event.entityType} />
      </td>
      <td className="px-4 py-3 text-sm font-medium text-foreground">
        {event.actorName ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
        {event.ipAddress ?? '—'}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {event.timestamp ? formatDateTime(event.timestamp) : '—'}
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AuditLogPage() {
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const { data, isLoading, isError, refetch } = useAuditLog(page, 25, {
    action:     filters.action     !== '' ? filters.action     : undefined,
    entityType: filters.entityType !== '' ? filters.entityType : undefined,
  })

  const events     = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const total      = data?.totalElements ?? 0

  const hasFilters = filters.action !== '' || filters.entityType !== ''

  if (isLoading) return <ListPageSkeleton />
  if (isError) return <ErrorMessage message="Failed to load audit log." onRetry={() => refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit Log"
        description="All changes made across your tenant — who changed what and when."
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Action filter */}
        <Select
          value={filters.action !== '' ? filters.action : 'all'}
          onValueChange={(v) => setFilter('action', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {ACTION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Entity type filter */}
        <Select
          value={filters.entityType !== '' ? filters.entityType : 'all'}
          onValueChange={(v) => setFilter('entityType', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-44 h-8 text-sm">
            <SelectValue placeholder="All record types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All record types</SelectItem>
            {ENTITY_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            Clear filters
          </Button>
        )}

        {total > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {total.toLocaleString()} event{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {events.length === 0 ? (
          <div className="px-5 py-12">
            <EmptyState
              icon={ShieldCheck}
              title="No events found"
              description={hasFilters ? 'Try adjusting your filters.' : 'Activity will appear here as your team uses the CRM.'}
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-24">Action</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-36">Record Type</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actor</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell w-32">IP Address</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground w-40">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <AuditRow key={event.id} event={event} />
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t">
                <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
