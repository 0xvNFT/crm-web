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

export function useDashboardStats() {
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

  return { accounts, leads, pendingOrders, activities }
}
