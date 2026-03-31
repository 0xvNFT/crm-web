/**
 * SUPER_ADMIN only — /api/admin/**
 * These endpoints are NOT used in crm-web (tenant-facing app).
 * They exist here so the types/hooks are available if crm-admin is ever merged,
 * or for debugging via the React Query devtools.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PlanResponse, UpdatePlanRequest } from '@/api/app-types'

export function usePlan(id: string) {
  return useQuery({
    queryKey: ['admin', 'plans', id],
    queryFn: () =>
      client.get<PlanResponse>(`/api/v1/admin/plans/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useUpdatePlan(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdatePlanRequest) =>
      client.put<PlanResponse>(`/api/v1/admin/plans/${id}`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plans', id] })
    },
  })
}

export function useReactivateTenant(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      client.post(`/api/v1/admin/tenants/${id}/reactivate`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'tenants'] })
    },
  })
}
