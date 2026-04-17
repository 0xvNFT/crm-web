import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PharmaCampaign,
  PagePharmaCampaign,
  CampaignContact,
  PageCampaignContact,
  CampaignProduct,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  AddCampaignContactRequest,
  UpdateCampaignContactRequest,
  AddCampaignProductRequest,
} from '@/api/app-types'

// ─── List (paginated) ─────────────────────────────────────────────────────────
export function useCampaigns(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['campaigns', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaCampaign>('/api/v1/pharma/campaigns', {
          params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

// ─── Search ───────────────────────────────────────────────────────────────────
export function useCampaignSearch(q: string) {
  return useQuery({
    queryKey: ['campaigns', 'search', q],
    queryFn: ({ signal }) =>
      client
        .get<PagePharmaCampaign>('/api/v1/pharma/campaigns/search', { params: { q }, signal })
        .then((r) => r.data.content ?? []),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

// ─── Detail ───────────────────────────────────────────────────────────────────
export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () =>
      client.get<PharmaCampaign>(`/api/v1/pharma/campaigns/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────
export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCampaignRequest) =>
      client.post<PharmaCampaign>('/api/v1/pharma/campaigns', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────
export function useUpdateCampaign(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCampaignRequest) =>
      client.put<PharmaCampaign>(`/api/v1/pharma/campaigns/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────
export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/pharma/campaigns/${id}`),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: ['campaigns', id] })
      qc.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

// ─── Lifecycle actions ────────────────────────────────────────────────────────
export function useActivateCampaign(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post<PharmaCampaign>(`/api/v1/pharma/campaigns/${id}/activate`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useCompleteCampaign(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post<PharmaCampaign>(`/api/v1/pharma/campaigns/${id}/complete`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useCancelCampaign(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post<PharmaCampaign>(`/api/v1/pharma/campaigns/${id}/cancel`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

// ─── Campaign Contacts ────────────────────────────────────────────────────────
export function useCampaignContacts(campaignId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'contacts', { page, size }],
    queryFn: () =>
      client
        .get<PageCampaignContact>(`/api/v1/pharma/campaigns/${campaignId}/contacts`, {
          params: { page, size },
        })
        .then((r) => r.data),
    enabled: !!campaignId,
    placeholderData: (prev) => prev,
  })
}

export function useAddCampaignContact(campaignId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AddCampaignContactRequest) =>
      client
        .post<CampaignContact[]>(`/api/v1/pharma/campaigns/${campaignId}/contacts`, data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId, 'contacts'] })
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId] })
    },
  })
}

export function useUpdateCampaignContact(campaignId: string, entryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateCampaignContactRequest) =>
      client
        .put<CampaignContact>(
          `/api/v1/pharma/campaigns/${campaignId}/contacts/${entryId}`,
          data,
        )
        .then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId, 'contacts'] }),
  })
}

export function useRemoveCampaignContact(campaignId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entryId: string) =>
      client.delete(`/api/v1/pharma/campaigns/${campaignId}/contacts/${entryId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId, 'contacts'] })
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId] })
    },
  })
}

// ─── Campaign Products ────────────────────────────────────────────────────────
export function useCampaignProducts(campaignId: string) {
  return useQuery({
    queryKey: ['campaigns', campaignId, 'products'],
    queryFn: () =>
      client
        .get<CampaignProduct[]>(`/api/v1/pharma/campaigns/${campaignId}/products`)
        .then((r) => r.data),
    enabled: !!campaignId,
  })
}

export function useAddCampaignProduct(campaignId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AddCampaignProductRequest) =>
      client
        .post<CampaignProduct>(`/api/v1/pharma/campaigns/${campaignId}/products`, data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId, 'products'] })
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId] })
    },
  })
}

export function useRemoveCampaignProduct(campaignId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (entryId: string) =>
      client.delete(`/api/v1/pharma/campaigns/${campaignId}/products/${entryId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId, 'products'] })
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId] })
    },
  })
}
