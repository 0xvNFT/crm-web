import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type { PagePharmaAccount, PagePharmaLead, PagePharmaOrder, PagePharmaActivity } from '@/api/app-types'

// Fetches page 0 size 1 — we only need totalElements for the KPI count
function fetchCount(url: string, params?: Record<string, string>) {
  return client
    .get<PagePharmaAccount | PagePharmaLead | PagePharmaOrder | PagePharmaActivity>(url, {
      params: { page: 0, size: 1, ...params },
    })
    .then((r) => r.data.totalElements ?? 0)
}

interface DashboardStatsOptions {
  /** When provided, scopes visits and activities to a specific rep (FIELD_REP self-scope) */
  repId?: string
}

export function useDashboardStats({ repId }: DashboardStatsOptions = {}) {
  // Org-wide counts — backend always scopes by tenantId from JWT; no repId needed
  const accounts = useQuery({
    queryKey: ['dashboard', 'stat', 'accounts'],
    queryFn: () => fetchCount('/api/v1/pharma/accounts'),
  })

  const leads = useQuery({
    queryKey: ['dashboard', 'stat', 'leads'],
    queryFn: () => fetchCount('/api/v1/pharma/leads'),
  })

  const pendingOrders = useQuery({
    queryKey: ['dashboard', 'stat', 'orders-pending'],
    queryFn: () => fetchCount('/api/v1/pharma/orders', { status: 'PENDING_APPROVAL' }),
  })

  const activities = useQuery({
    queryKey: ['dashboard', 'stat', 'activities'],
    queryFn: () => fetchCount('/api/v1/pharma/activities'),
  })

  // Rep-scoped visit count — only fetched for FIELD_REP (repId is set); passes repId as param
  const myVisits = useQuery({
    queryKey: ['dashboard', 'stat', 'my-visits', repId],
    queryFn: () => fetchCount('/api/v1/pharma/visits', repId ? { repId } : undefined),
    enabled: !!repId,
  })

  return { accounts, leads, pendingOrders, activities, myVisits }
}
