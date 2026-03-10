import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PharmaTerritory,
  PagePharmaTerritory,
  PharmaAccountTerritory,
  CreateTerritoryRequest,
  UpdateTerritoryRequest,
} from '@/api/app-types'

export function useTerritories(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['territories', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaTerritory>('/api/pharma/territories', {
          params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useTerritory(id: string) {
  return useQuery({
    queryKey: ['territories', id],
    queryFn: () => client.get<PharmaTerritory>(`/api/pharma/territories/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useTerritorySearch(q: string) {
  return useQuery({
    queryKey: ['territories', 'search', q],
    queryFn: () =>
      client
        .get<PharmaTerritory[]>('/api/pharma/territories/search', { params: { q } })
        .then((r) => r.data),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useTerritoryAccounts(id: string) {
  return useQuery({
    queryKey: ['territories', id, 'accounts'],
    queryFn: () =>
      client
        .get<PharmaAccountTerritory[]>(`/api/pharma/territories/${id}/accounts`)
        .then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateTerritory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTerritoryRequest) =>
      client.post<PharmaTerritory>('/api/pharma/territories', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories'] }),
  })
}

export function useUpdateTerritory(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTerritoryRequest) =>
      client.put<PharmaTerritory>(`/api/pharma/territories/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['territories'] }),
  })
}
