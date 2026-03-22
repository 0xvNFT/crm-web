import axios from 'axios'
import { useQuery, useMutation } from '@tanstack/react-query'
import client from '@/api/client'
import type { BillingSubscription, CheckoutRequest, PortalRequest, PlanResponse } from '@/api/app-types'

export function useListPlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    // Uses tenant-facing endpoint — NOT /api/admin/plans (SUPER_ADMIN only)
    queryFn: () =>
      client.get<PlanResponse[]>('/api/billing/plans').then((r) => r.data),
    staleTime: 5 * 60 * 1000, // plans rarely change
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () =>
      client.get<BillingSubscription>('/api/billing/subscription')
        .then((r) => r.data)
        .catch((err: unknown) => {
          // 404 = no subscription exists yet — return null, not an error
          if (axios.isAxiosError(err) && err.response?.status === 404) return null
          throw err
        }),
  })
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (body: CheckoutRequest) =>
      client
        .post<Record<string, string>>('/api/billing/checkout', body)
        .then((r) => r.data['checkoutUrl'] as string),
  })
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: (body: PortalRequest) =>
      client
        .post<Record<string, string>>('/api/billing/portal', body)
        .then((r) => r.data['portalUrl'] as string),
  })
}
