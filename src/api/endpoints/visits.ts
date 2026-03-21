import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PharmaFieldVisit,
  PagePharmaFieldVisit,
  ScheduleVisitRequest,
  UpdateVisitRequest,
  CheckInRequest,
  CheckOutRequest,
  SignatureRequest,
} from '@/api/app-types'

// ─── Queries ───────────────────────────────────────────────────────────────────

export function useVisits(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['visits', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaFieldVisit>('/api/pharma/visits', {
          params: { page, size, sort: 'scheduledStart,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useVisit(id: string) {
  return useQuery({
    queryKey: ['visits', id],
    queryFn: () =>
      client.get<PharmaFieldVisit>(`/api/pharma/visits/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useVisitSearch(query: string) {
  return useQuery({
    queryKey: ['visits', 'search', query],
    queryFn: () =>
      client
        .get<PharmaFieldVisit[]>('/api/pharma/visits/search', { params: { q: query } })
        .then((r) => r.data),
    enabled: query.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useVisitsByContact(contactId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ['visits', 'by-contact', contactId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaFieldVisit>(`/api/pharma/visits/by-contact/${contactId}`, {
          params: { page, size, sort: 'scheduledStart,desc' },
        })
        .then((r) => r.data),
    enabled: !!contactId,
    placeholderData: (prev) => prev,
  })
}

export function useVisitsByAccount(accountId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ['visits', 'by-account', accountId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaFieldVisit>(`/api/pharma/visits/by-account/${accountId}`, {
          params: { page, size, sort: 'scheduledStart,desc' },
        })
        .then((r) => r.data),
    enabled: !!accountId,
    placeholderData: (prev) => prev,
  })
}

export function useVisitsPendingReview(page = 0, size = 20) {
  return useQuery({
    queryKey: ['visits', 'pending-review', { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaFieldVisit>('/api/pharma/visits/pending-review', {
          params: { page, size, sort: 'scheduledStart,desc' },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

// ─── Schedule (Create) ────────────────────────────────────────────────────────

export function useScheduleVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ScheduleVisitRequest) =>
      client.post<PharmaFieldVisit>('/api/pharma/visits', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visits'] }),
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateVisit(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateVisitRequest) =>
      client.put<PharmaFieldVisit>(`/api/pharma/visits/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visits', id] })
      qc.invalidateQueries({ queryKey: ['visits', 'list'] })
    },
  })
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export function useSubmitVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post<PharmaFieldVisit>(`/api/pharma/visits/${id}/submit`).then((r) => r.data),
    onSuccess: (_data, id) => qc.invalidateQueries({ queryKey: ['visits', id] }),
  })
}

export function useApproveVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post<PharmaFieldVisit>(`/api/pharma/visits/${id}/approve`).then((r) => r.data),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['visits', id] })
      qc.invalidateQueries({ queryKey: ['visits', 'pending-review'] })
    },
  })
}

export function useRejectVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      client
        .post<PharmaFieldVisit>(`/api/pharma/visits/${id}/reject`, { reason })
        .then((r) => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['visits', id] })
      qc.invalidateQueries({ queryKey: ['visits', 'pending-review'] })
    },
  })
}

export function useCheckInVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & CheckInRequest) =>
      client
        .post<PharmaFieldVisit>(`/api/pharma/visits/${id}/check-in`, payload)
        .then((r) => r.data),
    onSuccess: (_data, { id }) => qc.invalidateQueries({ queryKey: ['visits', id] }),
  })
}

export function useCheckOutVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & CheckOutRequest) =>
      client
        .post<PharmaFieldVisit>(`/api/pharma/visits/${id}/check-out`, payload)
        .then((r) => r.data),
    onSuccess: (_data, { id }) => qc.invalidateQueries({ queryKey: ['visits', id] }),
  })
}

export function useCaptureSignature() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & SignatureRequest) =>
      client
        .post<PharmaFieldVisit>(`/api/pharma/visits/${id}/signature`, payload)
        .then((r) => r.data),
    onSuccess: (_data, { id }) => qc.invalidateQueries({ queryKey: ['visits', id] }),
  })
}
