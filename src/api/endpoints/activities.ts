import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaActivity, PagePharmaActivity } from '@/api/app-types'

export function useActivities(page = 0, size = 20) {
  return useQuery({
    queryKey: ['activities', 'list', { page, size }],
    queryFn: () =>
      client.get('/api/pharma/activities', {
        params: { page, size, sort: 'scheduledAt,desc' },
      }).then((r: { data: PagePharmaActivity }) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () =>
      client.get(`/api/pharma/activities/${id}`).then((r: { data: PharmaActivity }) => r.data),
    enabled: !!id,
  })
}