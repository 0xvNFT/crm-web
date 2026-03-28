import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { RepTarget, PageRepTarget, CreateRepTargetRequest, UpdateRepTargetRequest } from '@/api/app-types'

export function useRepTargets(year: number, month: number, page = 0, size = 50) {
  return useQuery({
    queryKey: ['rep-targets', { year, month, page }],
    queryFn: () =>
      client
        .get<PageRepTarget>('/api/pharma/rep-targets', { params: { year, month, page, size } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useCreateRepTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRepTargetRequest) =>
      client.post<RepTarget>('/api/pharma/rep-targets', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rep-targets'] }),
  })
}

export function useUpdateRepTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRepTargetRequest }) =>
      client.put<RepTarget>(`/api/pharma/rep-targets/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rep-targets'] }),
  })
}

export function useDeleteRepTarget() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.delete(`/api/pharma/rep-targets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rep-targets'] }),
  })
}
