import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaOrder, PagePharmaOrder } from '@/api/app-types'

export function useOrders(page = 0, size = 20, filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['orders', 'list', { page, size, filters }],
    queryFn: () =>
      client
        .get<PagePharmaOrder>('/api/pharma/orders', {
          params: { page, size, sort: 'createdAt,desc', ...filters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () =>
      client.get<PharmaOrder>(`/api/pharma/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useOrderSearch(q: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['orders', 'search', { q, page, size }],
    queryFn: () =>
      client
        .get<PagePharmaOrder>('/api/pharma/orders/search', {
          params: { q, page, size },
        })
        .then((r) => r.data),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PharmaOrder>) =>
      client.post<PharmaOrder>('/api/pharma/orders', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useUpdateOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PharmaOrder>) =>
      client.put<PharmaOrder>(`/api/pharma/orders/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}