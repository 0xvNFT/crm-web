import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PharmaInvoice,
  PagePharmaInvoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
} from '@/api/app-types'

export function useInvoices(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['invoices', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaInvoice>('/api/v1/pharma/invoices', {
          params: { page, size, sort: 'invoiceDate,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useInvoiceSearch(q: string) {
  return useQuery({
    queryKey: ['invoices', 'search', q],
    queryFn: () =>
      client
        .get<PagePharmaInvoice>('/api/v1/pharma/invoices/search', { params: { q } })
        .then((r) => r.data.content ?? []),
    enabled: q.trim().length >= 2,
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => client.get<PharmaInvoice>(`/api/v1/pharma/invoices/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useInvoicesByAccount(accountId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ['invoices', 'by-account', accountId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaInvoice>(`/api/v1/pharma/invoices/by-account/${accountId}`, {
          params: { page, size, sort: 'invoiceDate,desc' },
        })
        .then((r) => r.data),
    enabled: !!accountId,
    placeholderData: (prev) => prev,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInvoiceRequest) =>
      client.post<PharmaInvoice>('/api/v1/pharma/invoices', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices', 'list'] }),
  })
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateInvoiceRequest) =>
      client.put<PharmaInvoice>(`/api/v1/pharma/invoices/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoices', 'list'] })
    },
  })
}

export function useSendInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => client.post<PharmaInvoice>(`/api/v1/pharma/invoices/${id}/send`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function usePayInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => client.post<PharmaInvoice>(`/api/v1/pharma/invoices/${id}/pay`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function useVoidInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => client.post<PharmaInvoice>(`/api/v1/pharma/invoices/${id}/void`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}
