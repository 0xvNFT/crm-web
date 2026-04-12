import axios from 'axios'
import { useQuery, useMutation } from '@tanstack/react-query'
import client from '@/api/client'
import type { BillingSubscription, CheckoutRequest, PortalRequest, PlanResponse } from '@/api/app-types'

export function useListPlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () =>
      client.get<PlanResponse[]>('/api/v1/billing/plans')
        .then((r) => r.data)
        .catch((err: unknown) => {
          // 404 = billing not available in this deployment — not an error
          if (axios.isAxiosError(err) && err.response?.status === 404) return null
          throw err
        }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () =>
      client.get<BillingSubscription>('/api/v1/billing/subscription')
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
        .post<Record<string, string>>('/api/v1/billing/checkout', body)
        .then((r) => r.data['checkoutUrl'] as string),
  })
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: (body: PortalRequest) =>
      client
        .post<Record<string, string>>('/api/v1/billing/portal', body)
        .then((r) => r.data['portalUrl'] as string),
  })
}
