import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { User, PageUser, StaffMember, CreateStaffRequest, UpdateStaffRequest } from '@/api/app-types'

// ─── Normalizer ───────────────────────────────────────────────────────────────
// Backend now returns StaffResponse DTO — roles is string[], manager is flat (managerId/managerName).
export function mapStaffMember(raw: User): StaffMember {
  return {
    id:           raw.id ?? '',
    firstName:    raw.firstName ?? '',
    lastName:     raw.lastName ?? '',
    fullName:     raw.fullName ?? `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim(),
    email:        raw.email ?? '',
    role:         raw.roles?.[0] ?? '',
    jobTitle:     raw.jobTitle,
    department:   raw.department,
    phoneWork:    raw.phoneWork,
    phoneMobile:  raw.phoneMobile,
    status:       raw.status,
    emailVerified: raw.emailVerified,
    createdAt:    raw.createdAt,
    manager:      raw.managerId ? {
      id:       raw.managerId,
      fullName: raw.managerName,
    } : undefined,
  }
}

export function useStaff(page = 0, size = 20) {
  return useQuery({
    queryKey: ['users', 'list', { page, size }],
    queryFn: () =>
      client
        .get<PageUser>('/api/v1/pharma/users', { params: { page, size, sort: 'createdAt,desc' } })
        .then((r) => ({
          ...r.data,
          content: (r.data.content ?? []).map(mapStaffMember),
        })),
    placeholderData: (prev) => prev,
  })
}

export function useStaffSearch(q: string) {
  return useQuery({
    queryKey: ['users', 'search', q],
    queryFn: ({ signal }) =>
      client
        .get<User[]>('/api/v1/pharma/users/search', { params: { q }, signal })
        .then((r) => r.data.map(mapStaffMember)),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () =>
      client.get<User>(`/api/v1/pharma/users/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useInviteStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateStaffRequest) =>
      client.post<User>('/api/v1/pharma/users', payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })
}

export function useUpdateStaff(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateStaffRequest) =>
      client.put<User>(`/api/v1/pharma/users/${id}`, payload).then((r) => r.data),
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
      client.post(`/api/v1/pharma/users/${id}/deactivate`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['users', 'list'] })
      qc.invalidateQueries({ queryKey: ['users', id] })
    },
  })
}

export function useReactivateStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post(`/api/v1/pharma/users/${id}/reactivate`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['users', 'list'] })
      qc.invalidateQueries({ queryKey: ['users', id] })
    },
  })
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) =>
      client.post(`/api/v1/pharma/users/${id}/resend-invite`).then((r) => r.data),
  })
}
