import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type { PageAuditEvent } from '@/api/app-types'
import type { AuditEntityType } from '@/components/shared/EntityHistorySection'

// ─── Tenant-wide audit log (ADMIN/MANAGER only) ────────────────────────────────
export function useAuditLog(
  page = 0,
  size = 25,
  filters: { action?: string; entityType?: string; actorId?: string } = {},
) {
  const params: Record<string, string | number> = { page, size, sort: 'timestamp,desc' }
  if (filters.action)     params.action     = filters.action
  if (filters.entityType) params.entityType = filters.entityType
  if (filters.actorId)    params.actorId    = filters.actorId

  return useQuery({
    queryKey: ['audit', 'log', { page, size, ...filters }],
    queryFn: () =>
      client
        .get<PageAuditEvent>('/api/v1/pharma/audit', { params })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

// ─── Entity history (all roles) — embedded History tab on detail pages ─────────
export function useEntityHistory(
  entityType: AuditEntityType,
  entityId: string,
  page = 0,
  size = 10,
) {
  return useQuery({
    queryKey: ['audit', 'entity', entityType, entityId, { page, size }],
    queryFn: () =>
      client
        .get<PageAuditEvent>(
          `/api/v1/pharma/audit/entity/${entityType}/${entityId}`,
          { params: { page, size, sort: 'timestamp,desc' } },
        )
        .then((r) => r.data),
    enabled: !!entityId,
    placeholderData: (prev) => prev,
  })
}

