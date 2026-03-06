import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaAccount, PagePharmaAccount } from '@/api/app-types'
import type { components } from '@/api/types'

type CreateAccountRequest = components['schemas']['CreatePharmaAccountRequest']
type UpdateAccountRequest = components['schemas']['UpdatePharmaAccountRequest']

export function useAccounts(page = 0, size = 20) {
  return useQuery({
    queryKey: ['accounts', 'list', { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaAccount>('/api/pharma/accounts', { params: { page, size, sort: 'createdAt,desc' } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => client.get<PharmaAccount>(`/api/pharma/accounts/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAccountRequest) =>
      client.post<PharmaAccount>('/api/pharma/accounts', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useUpdateAccount(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateAccountRequest) =>
      client.put<PharmaAccount>(`/api/pharma/accounts/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/api/pharma/accounts/${id}`),
    onSuccess: (_data, id) => {
      // Remove the detail cache entry immediately — prevents a 400 refetch after navigation
      qc.removeQueries({ queryKey: ['accounts', id] })
      qc.invalidateQueries({ queryKey: ['accounts', 'list'] })
    },
  })
}
