import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PharmaTeam,
  PagePharmaTeam,
  TeamMemberResponse,
  CreateTeamRequest,
} from '@/api/app-types'

export function useTeams(page = 0, size = 20) {
  return useQuery({
    queryKey: ['teams', 'list', { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaTeam>('/api/pharma/teams', { params: { page, size, sort: 'createdAt,desc' } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => client.get<PharmaTeam>(`/api/pharma/teams/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useTeamSearch(q: string) {
  return useQuery({
    queryKey: ['teams', 'search', q],
    queryFn: () =>
      client
        .get<PharmaTeam[]>('/api/pharma/teams/search', { params: { q } })
        .then((r) => r.data),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useTeamMembers(id: string) {
  return useQuery({
    queryKey: ['teams', id, 'members'],
    queryFn: () =>
      client.get<TeamMemberResponse[]>(`/api/pharma/teams/${id}/members`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTeamRequest) =>
      client.post<PharmaTeam>('/api/pharma/teams', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useDeactivateTeam(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post<PharmaTeam>(`/api/pharma/teams/${id}/deactivate`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useReactivateTeam(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post<PharmaTeam>(`/api/pharma/teams/${id}/reactivate`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useAddTeamMember(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      client.post<TeamMemberResponse>(`/api/pharma/teams/${teamId}/members/${userId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'members'] })
      qc.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

export function useRemoveTeamMember(teamId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      client.delete(`/api/pharma/teams/${teamId}/members/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', teamId, 'members'] })
      qc.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}
