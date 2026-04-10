import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaOrder, PharmaInvoice, PagePharmaOrder, CreateOrderRequest, UpdateOrderRequest } from '@/api/app-types'

export function useOrders(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['orders', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaOrder>('/api/v1/pharma/orders', {
          params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () =>
      client.get<PharmaOrder>(`/api/v1/pharma/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useOrderSearch(q: string) {
  return useQuery({
    queryKey: ['orders', 'search', q],
    queryFn: ({ signal }) =>
      client
        .get<PagePharmaOrder>('/api/v1/pharma/orders/search', {
          params: { q },
          signal,
        })
        .then((r) => r.data.content ?? []),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrderRequest) =>
      client.post<PharmaOrder>('/api/v1/pharma/orders', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useApproveOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => client.post<PharmaOrder>(`/api/v1/pharma/orders/${id}/approve`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useRejectOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (reason: string) =>
      client.post<PharmaOrder>(`/api/v1/pharma/orders/${id}/reject`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useUpdateOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateOrderRequest) =>
      client.put<PharmaOrder>(`/api/v1/pharma/orders/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useShipOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => client.post<PharmaOrder>(`/api/v1/pharma/orders/${id}/ship`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useDeliverOrder(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => client.post<PharmaOrder>(`/api/v1/pharma/orders/${id}/deliver`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useGenerateInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post<PharmaInvoice>(`/api/v1/pharma/orders/${id}/generate-invoice`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders', id] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}
