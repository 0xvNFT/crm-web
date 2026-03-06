import { useQuery } from '@tanstack/react-query'
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
