import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { Notification, PageNotification } from '@/api/app-types'

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () =>
      client
        .get<PageNotification>('/api/notifications', { params: { page: 0, size: 20 } })
        .then((r) => r.data),
    // Poll every 30s + refetch on tab focus so badge stays fresh
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useAllNotifications(page = 0) {
  return useQuery({
    queryKey: ['notifications', 'all', page],
    queryFn: () =>
      client
        .get<PageNotification>('/api/notifications/all', { params: { page, size: 20 } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post<Notification>(`/api/notifications/${id}/read`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post('/api/notifications/read-all').then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
