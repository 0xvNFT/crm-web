import { useQuery, useMutation } from '@tanstack/react-query'
import client from '@/api/client'
import type { BillingSubscription, CheckoutRequest, PortalRequest } from '@/api/app-types'

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () =>
      client.get<BillingSubscription>('/api/billing/subscription').then((r) => r.data),
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
