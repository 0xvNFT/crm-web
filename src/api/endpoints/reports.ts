import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PipelineSummary,
  LeadFunnelSummary,
  InvoiceAgingSummary,
  ActivitySummary,
} from '@/api/app-types'

export function usePipelineSummary() {
  return useQuery({
    queryKey: ['reports', 'pipeline'],
    queryFn: () =>
      client.get<PipelineSummary[]>('/api/pharma/reports/pipeline').then((r) => r.data),
  })
}

export function useLeadFunnelSummary() {
  return useQuery({
    queryKey: ['reports', 'lead-funnel'],
    queryFn: () =>
      client.get<LeadFunnelSummary[]>('/api/pharma/reports/lead-funnel').then((r) => r.data),
  })
}

export function useInvoiceAgingSummary() {
  return useQuery({
    queryKey: ['reports', 'invoice-aging'],
    queryFn: () =>
      client.get<InvoiceAgingSummary[]>('/api/pharma/reports/invoice-aging').then((r) => r.data),
  })
}

export function useActivitySummary() {
  return useQuery({
    queryKey: ['reports', 'activities'],
    queryFn: () =>
      client.get<ActivitySummary[]>('/api/pharma/reports/activities').then((r) => r.data),
  })
}
