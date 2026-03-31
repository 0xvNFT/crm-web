import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaAccount, PagePharmaAccount, CreatePharmaAccountRequest, UpdatePharmaAccountRequest } from '@/api/app-types'

export function useAccounts(page = 0, size = 20, filters: Record<string, string> = {}) {
  const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
  return useQuery({
    queryKey: ['accounts', 'list', { page, size, ...cleanFilters }],
    queryFn: () =>
      client
        .get<PagePharmaAccount>('/api/v1/pharma/accounts', {
          params: { page, size, sort: 'createdAt,desc', ...cleanFilters },
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => client.get<PharmaAccount>(`/api/v1/pharma/accounts/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePharmaAccountRequest) =>
      client.post<PharmaAccount>('/api/v1/pharma/accounts', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useUpdateAccount(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePharmaAccountRequest) =>
      client.put<PharmaAccount>(`/api/v1/pharma/accounts/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useAccountSearch(q: string) {
  return useQuery({
    queryKey: ['accounts', 'search', q],
    queryFn: ({ signal }) =>
      client
        .get<PagePharmaAccount>('/api/v1/pharma/accounts/search', { params: { q }, signal })
        .then((r) => r.data.content ?? []),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/pharma/accounts/${id}`),
    onSuccess: (_data, id) => {
      // Remove the detail cache entry immediately — prevents a 400 refetch after navigation
      qc.removeQueries({ queryKey: ['accounts', id] })
      qc.invalidateQueries({ queryKey: ['accounts', 'list'] })
    },
  })
}
