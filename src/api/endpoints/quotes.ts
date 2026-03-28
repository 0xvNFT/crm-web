import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaQuote, PharmaOrder, PagePharmaQuote, CreateQuoteRequest, UpdateQuoteRequest } from '@/api/app-types'

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

export function useQuoteSearch(q: string) {
  return useQuery({
    queryKey: ['quotes', 'search', q],
    queryFn: () =>
      client
        .get<PharmaQuote[]>('/api/pharma/quotes/search', { params: { q } })
        .then((r) => r.data),
    enabled: q.trim().length >= 2,
  })
}

export function useCreateQuote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateQuoteRequest) =>
      client.post<PharmaQuote>('/api/pharma/quotes', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes'] }),
  })
}

export function useApproveQuote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => client.post<PharmaQuote>(`/api/pharma/quotes/${id}/approve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes', id] }),
  })
}

export function useRejectQuote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reason: string) =>
      client.post<PharmaQuote>(`/api/pharma/quotes/${id}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes', id] }),
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

export function useUpdateQuote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateQuoteRequest) =>
      client.put<PharmaQuote>(`/api/pharma/quotes/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes', id] })
      qc.invalidateQueries({ queryKey: ['quotes', 'list'] })
    },
  })
}

export function useConvertQuote(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post<PharmaOrder>(`/api/pharma/quotes/${id}/convert`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes', id] })
      qc.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
