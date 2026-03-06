import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaContact, PagePharmaContact } from '@/api/app-types'

export function useContacts(page = 0, size = 20) {
  return useQuery({
    queryKey: ['contacts', 'list', { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaContact>('/api/pharma/contacts', {
          params: { page, size, sort: 'lastName,asc' },
        })
        .then((r) => r.data),
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
    mutationFn: (data: Partial<PharmaContact>) =>
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
