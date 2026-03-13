import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaActivity, PagePharmaActivity } from '@/api/app-types'

export function useActivities(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  
  return useQuery({
    queryKey: ['activities', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client.get<PagePharmaActivity>('/api/pharma/activities', {
        params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useActivitySearch(q: string) {
  return useQuery({
    queryKey: ['activities', 'search', q],
    queryFn: () =>
      client.get<PharmaActivity[]>('/api/pharma/activities/search', { params: { q } })
        .then((r) => r.data),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () =>
      client
        .get<PharmaActivity>(`/api/pharma/activities/${id}`)
        .then((r) => r.data),
    enabled: !!id,
  })
}