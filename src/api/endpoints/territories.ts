import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PharmaTerritory,
  PagePharmaTerritory,
  PharmaAccountTerritory,
  CreateTerritoryRequest,
  UpdateTerritoryRequest,
  SecondaryRepInfo,
  TerritoryRepInfo,
  ProductFocusInfo,
  AddProductFocusRequest,
} from '@/api/app-types'

export function useTerritories(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['territories', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaTerritory>('/api/v1/pharma/territories', {
          params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useTerritory(id: string) {
  return useQuery({
    queryKey: ['territories', id],
    queryFn: () => client.get<PharmaTerritory>(`/api/v1/pharma/territories/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useTerritorySearch(q: string) {
  return useQuery({
    queryKey: ['territories', 'search', q],
    queryFn: ({ signal }) =>
      client
        .get<PagePharmaTerritory>('/api/v1/pharma/territories/search', { params: { q }, signal })
        .then((r) => r.data.content ?? []),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useTerritoryAccounts(id: string) {
  return useQuery({
    queryKey: ['territories', id, 'accounts'],
    queryFn: () =>
      client
        .get<PharmaAccountTerritory[]>(`/api/v1/pharma/territories/${id}/accounts`)
        .then((r) => r.data),
    enabled: !!id,
  })
}

export function useAssignTerritoryAccount(territoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (accountId: string) =>
      client
        .post<PharmaAccountTerritory>(`/api/v1/pharma/territories/${territoryId}/accounts/${accountId}`)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories', territoryId, 'accounts'] }),
  })
}

export function useRemoveTerritoryAccount(territoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: string) =>
      client.delete(`/api/v1/pharma/territories/account-assignments/${assignmentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories', territoryId, 'accounts'] }),
  })
}

// ─── All Reps (primary + secondary, role-labelled) ───────────────────────────

export function useTerritoryReps(id: string) {
  return useQuery({
    queryKey: ['territories', id, 'reps'],
    queryFn: () =>
      client
        .get<TerritoryRepInfo[]>(`/api/v1/pharma/territories/${id}/reps`)
        .then((r) => r.data),
    enabled: !!id,
  })
}

// ─── Secondary Reps ───────────────────────────────────────────────────────────

export function useTerritorySecondaryReps(id: string) {
  return useQuery({
    queryKey: ['territories', id, 'secondary-reps'],
    queryFn: () =>
      client
        .get<SecondaryRepInfo[]>(`/api/v1/pharma/territories/${id}/secondary-reps`)
        .then((r) => r.data),
    enabled: !!id,
  })
}

export function useAddSecondaryRep(territoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      client
        .post<SecondaryRepInfo>(`/api/v1/pharma/territories/${territoryId}/secondary-reps/${userId}`)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories', territoryId, 'secondary-reps'] }),
  })
}

export function useRemoveSecondaryRep(territoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      client.delete(`/api/v1/pharma/territories/${territoryId}/secondary-reps/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories', territoryId, 'secondary-reps'] }),
  })
}

// ─── Product Focus ────────────────────────────────────────────────────────────

export function useTerritoryProductFocus(id: string) {
  return useQuery({
    queryKey: ['territories', id, 'products'],
    queryFn: () =>
      client
        .get<ProductFocusInfo[]>(`/api/v1/pharma/territories/${id}/products`)
        .then((r) => r.data),
    enabled: !!id,
  })
}

export function useAddProductFocus(territoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AddProductFocusRequest) =>
      client
        .post<ProductFocusInfo>(`/api/v1/pharma/territories/${territoryId}/products`, data)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories', territoryId, 'products'] }),
  })
}

export function useRemoveProductFocus(territoryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) =>
      client.delete(`/api/v1/pharma/territories/${territoryId}/products/${productId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories', territoryId, 'products'] }),
  })
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function useCreateTerritory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTerritoryRequest) =>
      client.post<PharmaTerritory>('/api/v1/pharma/territories', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories'] }),
  })
}

export function useUpdateTerritory(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTerritoryRequest) =>
      client.put<PharmaTerritory>(`/api/v1/pharma/territories/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories'] }),
  })
}
