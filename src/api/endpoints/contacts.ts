import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaContact, PagePharmaContact, UpdateContactRequest, PharmaContactAffiliation, AddAffiliationRequest } from '@/api/app-types'

export function useContacts(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['contacts', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaContact>('/api/pharma/contacts', {
          params: { page, size, sort: 'lastName,asc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useContactSearch(name: string) {
  return useQuery({
    queryKey: ['contacts', 'search', name],
    queryFn: () =>
      client
        .get<PharmaContact[]>('/api/pharma/contacts/search', { params: { name } })
        .then((r) => r.data),
    enabled: name.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () =>
      client.get<PharmaContact>(`/api/pharma/contacts/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PharmaContact>) =>
      client.post<PharmaContact>('/api/pharma/contacts', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export function useUpdateContact(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateContactRequest) =>
      client.put<PharmaContact>(`/api/pharma/contacts/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/api/pharma/contacts/${id}`),
    onSuccess: (_data, id) => {
      // Remove the detail cache entry immediately — prevents a 400 refetch after navigation
      qc.removeQueries({ queryKey: ['contacts', id] })
      qc.invalidateQueries({ queryKey: ['contacts', 'list'] })
    },
  })
}

// ─── Affiliations ─────────────────────────────────────────────────────────────

export function useContactAffiliations(contactId: string) {
  return useQuery({
    queryKey: ['contacts', contactId, 'affiliations'],
    queryFn: () =>
      client
        .get<PharmaContactAffiliation[]>(`/api/pharma/contacts/${contactId}/affiliations`)
        .then((r) => r.data),
    enabled: !!contactId,
  })
}

export function useAddAffiliation(contactId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AddAffiliationRequest) =>
      client
        .post<PharmaContactAffiliation>(`/api/pharma/contacts/${contactId}/affiliations`, data)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts', contactId, 'affiliations'] }),
  })
}

export function useRemoveAffiliation(contactId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (affiliationId: string) =>
      client.delete(`/api/pharma/contacts/affiliations/${affiliationId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts', contactId, 'affiliations'] }),
  })
}
