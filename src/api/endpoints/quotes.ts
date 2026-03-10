import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaQuote, PagePharmaQuote } from '@/api/app-types'

export function useQuotes(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['quotes', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaQuote>('/api/pharma/quotes', {
          params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: ['quotes', id],
    queryFn: () =>
      client.get<PharmaQuote>(`/api/pharma/quotes/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}