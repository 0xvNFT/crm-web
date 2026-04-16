/**
 * EntityHistorySection — reusable audit history tab for any entity detail page.
 *
 * Shows a paginated timeline of all changes to a specific record.
 * Accessible by all roles (ADMIN, MANAGER, FIELD_REP).
 *
 * Usage:
 *   <EntityHistorySection entityType="PharmaAccount" entityId={account.id ?? ''} />
 *
 * entityType must be one of the AuditEntityType values (matches backend Java class name exactly).
 */
import { History } from 'lucide-react'
import { useEntityHistory } from '@/api/endpoints/audit'
import { usePagination } from '@/hooks/usePagination'
import { Pagination } from '@/components/shared/Pagination'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { AuditActionBadge } from '@/components/shared/AuditActionBadge'
import { formatDateTime } from '@/utils/formatters'
import type { AuditEvent } from '@/api/app-types'

// ─── Allowed entity types — must match backend Java class names exactly ────────
// Keep in sync with auditService.logEvent() calls across all *Service.java files.
export type AuditEntityType =
  | 'PharmaAccount'
  | 'PharmaContact'
  | 'PharmaContactAffiliation'
  | 'PharmaLead'
  | 'PharmaOpportunity'
  | 'PharmaQuote'
  | 'PharmaOrder'
  | 'PharmaInvoice'
  | 'PharmaProduct'
  | 'PharmaProductBatch'
  | 'PharmaMaterial'
  | 'PharmaActivity'
  | 'PharmaFieldVisit'
  | 'PharmaVisitAudit'
  | 'PharmaCoachingNote'
  | 'PharmaTeam'
  | 'PharmaTerritory'
  | 'PharmaAccountTerritory'
  | 'RepTarget'

// ─── Safe JSON parse helpers (no JSX in try/catch) ───────────────────────────
const SKIP_FIELDS = new Set(['id', 'tenantId', 'createdAt', 'updatedAt', 'version', 'passwordHash'])

type CreateEntries = Array<[string, string]>
type UpdateDiffs   = Array<{ key: string; from: string; to: string }>

function parseCreateEntries(json: string): CreateEntries | null {
  try {
    const obj = JSON.parse(json) as Record<string, unknown>
    const entries = Object.entries(obj)
      .filter(([k, v]) => !SKIP_FIELDS.has(k) && v !== null && v !== undefined && v !== '')
      .slice(0, 4)
      .map(([k, v]): [string, string] => [k, String(v)])
    return entries.length > 0 ? entries : null
  } catch {
    return null
  }
}

function parseUpdateDiffs(oldJson: string, newJson: string): UpdateDiffs | null {
  try {
    const oldObj = JSON.parse(oldJson) as Record<string, unknown>
    const newObj = JSON.parse(newJson) as Record<string, unknown>
    const SKIP = new Set(['id', 'tenantId', 'createdAt', 'updatedAt', 'version'])
    const truncate = (s: string) => s.length > 35 ? `${s.slice(0, 35)}…` : s
    const diffs = Object.keys(newObj)
      .filter((k) => !SKIP.has(k) && JSON.stringify(oldObj[k]) !== JSON.stringify(newObj[k]))
      .map((k) => ({
        key:  k,
        from: truncate(oldObj[k] != null ? String(oldObj[k]) : '(empty)'),
        to:   truncate(newObj[k] != null ? String(newObj[k]) : '(empty)'),
      }))
    return diffs.length > 0 ? diffs : null
  } catch {
    return null
  }
}

// ─── Delta display — show what changed ────────────────────────────────────────
function ChangeDelta({ event }: { event: AuditEvent }) {
  if (event.action === 'CREATE' && event.newValues) {
    const entries = parseCreateEntries(event.newValues)
    if (!entries) return null
    return (
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
        {entries.map(([k, v]) => (
          <span key={k} className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">{k}:</span>{' '}
            {v.length > 40 ? `${v.slice(0, 40)}…` : v}
          </span>
        ))}
      </div>
    )
  }

  if (event.action === 'UPDATE' && event.oldValues && event.newValues) {
    const diffs = parseUpdateDiffs(event.oldValues, event.newValues)
    if (!diffs) return null
    return (
      <div className="mt-1.5 space-y-0.5">
        {diffs.slice(0, 5).map(({ key, from, to }) => (
          <div key={key} className="text-xs flex items-baseline gap-1.5">
            <span className="font-medium text-foreground/70 shrink-0">{key}:</span>
            <span className="text-muted-foreground line-through">{from}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-foreground">{to}</span>
          </div>
        ))}
        {diffs.length > 5 && (
          <p className="text-xs text-muted-foreground">
            +{diffs.length - 5} more field{diffs.length - 5 > 1 ? 's' : ''}
          </p>
        )}
      </div>
    )
  }

  return null
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface EntityHistorySectionProps {
  entityType: AuditEntityType
  entityId: string
}

export function EntityHistorySection({ entityType, entityId }: EntityHistorySectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useEntityHistory(entityType, entityId, page, 10)

  const events     = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="px-5 py-3 border-b bg-muted/40 flex items-center gap-2">
        <History className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Change History</h2>
      </div>

      {isLoading ? (
        <div className="px-5 py-8 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : events.length === 0 ? (
        <div className="px-5 py-8">
          <EmptyState
            icon={History}
            title="No history yet"
            description="Changes to this record will appear here."
          />
        </div>
      ) : (
        <>
          {/* Timeline */}
          <div className="divide-y">
            {events.map((event) => (
              <div key={event.id} className="px-5 py-3.5 hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <AuditActionBadge action={event.action ?? 'CHANGE'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {event.actorName ?? 'System'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {event.timestamp ? formatDateTime(event.timestamp) : '—'}
                      </span>
                    </div>
                    <ChangeDelta event={event} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t">
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
