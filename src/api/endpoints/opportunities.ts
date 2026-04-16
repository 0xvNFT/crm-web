import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PharmaOpportunity,
  PagePharmaOpportunity,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  StageRequest,
  OpportunityProduct,
  AddOpportunityProductRequest,
  UpdateOpportunityProductRequest,
} from '@/api/app-types'

export function useOpportunities(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['opportunities', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaOpportunity>('/api/v1/pharma/opportunities', {
          params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useOpportunitySearch(q: string) {
  return useQuery({
    queryKey: ['opportunities', 'search', q],
    queryFn: ({ signal }) =>
      client
        .get<PagePharmaOpportunity>('/api/v1/pharma/opportunities/search', { params: { q }, signal })
        .then((r) => r.data.content ?? []),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunities', id],
    queryFn: () =>
      client.get<PharmaOpportunity>(`/api/v1/pharma/opportunities/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useOpportunitiesByContact(contactId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ['opportunities', 'by-contact', contactId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaOpportunity>('/api/v1/pharma/opportunities', {
          params: { page, size, sort: 'createdAt,desc', contactId },
        })
        .then((r) => r.data),
    enabled: !!contactId,
    placeholderData: (prev) => prev,
  })
}

export function useOpportunitiesByAccount(accountId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ['opportunities', 'by-account', accountId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaOpportunity>('/api/v1/pharma/opportunities', {
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
      client.post<PharmaOpportunity>('/api/v1/pharma/opportunities', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}

export function useUpdateOpportunity(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateOpportunityRequest) =>
      client.put<PharmaOpportunity>(`/api/v1/pharma/opportunities/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}

export function useAdvanceOpportunityStage(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StageRequest) =>
      client
        .post<PharmaOpportunity>(`/api/v1/pharma/opportunities/${id}/stage`, data)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opportunities'] }),
  })
}

// ── Opportunity Line Items (Products) ──────────────────────────────────────────

export function useOpportunityProducts(opportunityId: string) {
  return useQuery({
    queryKey: ['opportunities', opportunityId, 'products'],
    queryFn: () =>
      client
        .get<OpportunityProduct[]>(`/api/v1/pharma/opportunities/${opportunityId}/products`)
        .then((r) => r.data),
    enabled: !!opportunityId,
  })
}

export function useAddOpportunityProduct(opportunityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AddOpportunityProductRequest) =>
      client
        .post<OpportunityProduct>(`/api/v1/pharma/opportunities/${opportunityId}/products`, data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities', opportunityId, 'products'] })
      qc.invalidateQueries({ queryKey: ['opportunities', opportunityId] })
    },
  })
}

export function useUpdateOpportunityProduct(opportunityId: string, lineItemId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateOpportunityProductRequest) =>
      client
        .put<OpportunityProduct>(
          `/api/v1/pharma/opportunities/${opportunityId}/products/${lineItemId}`,
          data,
        )
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities', opportunityId, 'products'] })
      qc.invalidateQueries({ queryKey: ['opportunities', opportunityId] })
    },
  })
}

export function useRemoveOpportunityProduct(opportunityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lineItemId: string) =>
      client
        .delete(`/api/v1/pharma/opportunities/${opportunityId}/products/${lineItemId}`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opportunities', opportunityId, 'products'] })
      qc.invalidateQueries({ queryKey: ['opportunities', opportunityId] })
    },
  })
}
