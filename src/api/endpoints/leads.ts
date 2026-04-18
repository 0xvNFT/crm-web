import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaLead, PagePharmaLead, CreateLeadRequest, UpdateLeadRequest, ConvertLeadRequest, LeadConversionResult } from '@/api/app-types'

export function useLeads(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['leads', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client.get<PagePharmaLead>('/api/v1/pharma/leads', {
        params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
      }).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () =>
      client.get<PharmaLead>(`/api/v1/pharma/leads/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useLeadSearch(q: string) {
  return useQuery({
    queryKey: ['leads', 'search', q],
    queryFn: ({ signal }) =>
      client
        .get<PagePharmaLead>('/api/v1/pharma/leads/search', { params: { q }, signal })
        .then((r) => r.data.content ?? []),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useCreateLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeadRequest) =>
      client.post<PharmaLead>('/api/v1/pharma/leads', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateLeadRequest) =>
      client.put<PharmaLead>(`/api/v1/pharma/leads/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  })
}

export function useConvertLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvertLeadRequest }) =>
      client.post<LeadConversionResult>(`/api/v1/pharma/leads/${id}/convert`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] })
      // Conversion may create a contact, account, and/or opportunity — invalidate all three
      qc.invalidateQueries({ queryKey: ['contacts'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['opportunities'] })
    },
  })
}

export function useDeleteLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/pharma/leads/${id}`),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: ['leads', id] })
      qc.invalidateQueries({ queryKey: ['leads', 'list'] })
    },
  })
}
