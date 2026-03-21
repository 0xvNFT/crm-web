import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaActivity, PagePharmaActivity, CreateActivityRequest, UpdateActivityRequest } from '@/api/app-types'

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

export function useActivitiesByContact(contactId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ['activities', 'by-contact', contactId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaActivity>(`/api/pharma/activities/by-contact/${contactId}`, {
          params: { page, size, sort: 'createdAt,desc' },
        })
        .then((r) => r.data),
    enabled: !!contactId,
    placeholderData: (prev) => prev,
  })
}

export function useActivitiesByAccount(accountId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ['activities', 'by-account', accountId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaActivity>(`/api/pharma/activities/by-account/${accountId}`, {
          params: { page, size, sort: 'createdAt,desc' },
        })
        .then((r) => r.data),
    enabled: !!accountId,
    placeholderData: (prev) => prev,
  })
}

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateActivityRequest) =>
      client.post<PharmaActivity>('/api/pharma/activities', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities', 'list'] }),
  })
}

export function useUpdateActivity(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateActivityRequest) =>
      client.put<PharmaActivity>(`/api/pharma/activities/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities', id] })
      qc.invalidateQueries({ queryKey: ['activities', 'list'] })
    },
  })
}

export function useDeleteActivity(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => client.delete(`/api/pharma/activities/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities', 'list'] }),
  })
}