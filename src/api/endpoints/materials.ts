import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaMaterial, PagePharmaMaterial, UpdateMaterialRequest } from '@/api/app-types'

export function useMaterials(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['materials', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaMaterial>('/api/pharma/materials', {
          params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useMaterial(id: string) {
  return useQuery({
    queryKey: ['materials', id],
    queryFn: () =>
      client.get<PharmaMaterial>(`/api/pharma/materials/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useUpdateMaterial(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateMaterialRequest) =>
      client.put<PharmaMaterial>(`/api/pharma/materials/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] })
      qc.invalidateQueries({ queryKey: ['materials', 'list'] })
    },
  })
}

export function useApproveMaterial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post<PharmaMaterial>(`/api/pharma/materials/${id}/approve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materials'] }),
  })
}

export function useArchiveMaterial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post<PharmaMaterial>(`/api/pharma/materials/${id}/archive`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materials'] }),
  })
}
