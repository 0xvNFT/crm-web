import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaLead, PagePharmaLead, CreateLeadRequest, UpdateLeadRequest } from '@/api/app-types'

export function useLeads(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['leads', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client.get<PagePharmaLead>('/api/pharma/leads', {
        params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () =>
      client.get<PharmaLead>(`/api/pharma/leads/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useLeadSearch(name: string) {
  return useQuery({
    queryKey: ['leads', 'search', name],
    queryFn: () =>
      client
        .get<PharmaLead[]>('/api/pharma/leads/search', { params: { name } })
        .then((r) => r.data),
    enabled: name.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeadRequest) =>
      client.post<PharmaLead>('/api/pharma/leads', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateLeadRequest) =>
      client.put<PharmaLead>(`/api/pharma/leads/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/api/pharma/leads/${id}`),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: ['leads', id] })
      qc.invalidateQueries({ queryKey: ['leads', 'list'] })
    },
  })
}