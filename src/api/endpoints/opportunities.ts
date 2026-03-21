import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PharmaOpportunity,
  PagePharmaOpportunity,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  StageRequest,
} from '@/api/app-types'

export function useOpportunities(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['opportunities', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaOpportunity>('/api/pharma/opportunities', {
          params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useOpportunitySearch(q: string) {
  return useQuery({
    queryKey: ['opportunities', 'search', q],
    queryFn: () =>
      client
        .get<PharmaOpportunity[]>('/api/pharma/opportunities/search', { params: { q } })
        .then((r) => r.data),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunities', id],
    queryFn: () =>
      client.get<PharmaOpportunity>(`/api/pharma/opportunities/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useOpportunitiesByAccount(accountId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ['opportunities', 'by-account', accountId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaOpportunity>('/api/pharma/opportunities', {
          params: { page, size, sort: 'createdAt,desc', accountId },
        })
        .then((r) => r.data),
    enabled: !!accountId,
    placeholderData: (prev) => prev,
  })
}

export function useCreateOpportunity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOpportunityRequest) =>
      client.post<PharmaOpportunity>('/api/pharma/opportunities', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities', 'list'] }),
  })
}

export function useUpdateOpportunity(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateOpportunityRequest) =>
      client.put<PharmaOpportunity>(`/api/pharma/opportunities/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities', id] })
      qc.invalidateQueries({ queryKey: ['opportunities', 'list'] })
    },
  })
}

export function useAdvanceOpportunityStage(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StageRequest) =>
      client
        .post<PharmaOpportunity>(`/api/pharma/opportunities/${id}/stage`, data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities', id] })
      qc.invalidateQueries({ queryKey: ['opportunities', 'list'] })
    },
  })
}
