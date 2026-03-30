import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PharmaCoachingNote,
  PagePharmaCoachingNote,
  CreateCoachingNoteRequest,
  UpdateCoachingNoteRequest,
} from '@/api/app-types'

export function useCoachingNotes(page = 0, size = 20) {
  return useQuery({
    queryKey: ['coaching', 'list', { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaCoachingNote>('/api/pharma/coaching', {
          params: { page, size, sort: 'createdAt,desc' },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useCoachingSearch(q: string) {
  return useQuery({
    queryKey: ['coaching', 'search', q],
    queryFn: () =>
      client
        .get<PharmaCoachingNote[]>('/api/pharma/coaching/search', { params: { q } })
        .then((r) => r.data),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useCoachingNote(id: string) {
  return useQuery({
    queryKey: ['coaching', id],
    queryFn: () =>
      client.get<PharmaCoachingNote>(`/api/pharma/coaching/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCoachingByRep(repId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['coaching', 'by-rep', repId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaCoachingNote>(`/api/pharma/coaching/by-rep/${repId}`, {
          params: { page, size, sort: 'createdAt,desc' },
        })
        .then((r) => r.data),
    enabled: !!repId,
    placeholderData: (prev) => prev,
  })
}

export function useCoachingByCoach(coachId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['coaching', 'by-coach', coachId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaCoachingNote>(`/api/pharma/coaching/by-coach/${coachId}`, {
          params: { page, size, sort: 'createdAt,desc' },
        })
        .then((r) => r.data),
    enabled: !!coachId,
    placeholderData: (prev) => prev,
  })
}

export function useOverdueFollowUps(page = 0, size = 20) {
  return useQuery({
    queryKey: ['coaching', 'overdue', { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaCoachingNote>('/api/pharma/coaching/overdue-followups', {
          params: { page, size },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useCreateCoachingNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCoachingNoteRequest) =>
      client.post<PharmaCoachingNote>('/api/pharma/coaching', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coaching', 'list'] }),
  })
}

export function useUpdateCoachingNote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCoachingNoteRequest) =>
      client.put<PharmaCoachingNote>(`/api/pharma/coaching/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coaching'] })
      qc.invalidateQueries({ queryKey: ['coaching', 'list'] })
    },
  })
}

export function useCompleteFollowUp(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post<PharmaCoachingNote>(`/api/pharma/coaching/${id}/complete-followup`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coaching'] })
      qc.invalidateQueries({ queryKey: ['coaching', 'list'] })
      qc.invalidateQueries({ queryKey: ['coaching', 'overdue'] })
    },
  })
}
