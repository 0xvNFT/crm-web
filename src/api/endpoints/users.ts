import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { User, PageUser, CreateStaffRequest, UpdateStaffRequest, TenantUserSummary } from '@/api/app-types'

export function useStaff(page = 0, size = 20) {
  return useQuery({
    queryKey: ['users', 'list', { page, size }],
    queryFn: () =>
      client
        .get<PageUser>('/api/pharma/users', { params: { page, size, sort: 'createdAt,desc' } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useStaffSearch(q: string) {
  return useQuery({
    queryKey: ['users', 'search', q],
    queryFn: () =>
      client
        .get<TenantUserSummary[]>('/api/pharma/users/search', { params: { q } })
        .then((r) => r.data),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () =>
      client.get<User>(`/api/pharma/users/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useInviteStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStaffRequest) =>
      client.post<User>('/api/pharma/users', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })
}

export function useUpdateStaff(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateStaffRequest) =>
      client.put<User>(`/api/pharma/users/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'list'] })
      qc.invalidateQueries({ queryKey: ['users', id] })
    },
  })
}

export function useDeactivateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post(`/api/pharma/users/${id}/deactivate`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })
}

export function useReactivateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post(`/api/pharma/users/${id}/reactivate`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) =>
      client.post(`/api/pharma/users/${id}/resend-invite`).then((r) => r.data),
  })
}
