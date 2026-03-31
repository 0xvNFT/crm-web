import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PipelineSummary,
  LeadFunnelSummary,
  InvoiceAgingSummary,
  ActivitySummary,
  KpiCallSummaryRow,
  KpiActivitySummaryRow,
  KpiDoctorCoverageRow,
  KpiTerritoryPerformanceRow,
  KpiPeriod,
} from '@/api/app-types'

export function usePipelineSummary() {
  return useQuery({
    queryKey: ['reports', 'pipeline'],
    queryFn: () =>
      client.get<PipelineSummary[]>('/api/v1/pharma/reports/pipeline').then((r) => r.data),
  })
}

export function useLeadFunnelSummary() {
  return useQuery({
    queryKey: ['reports', 'lead-funnel'],
    queryFn: () =>
      client.get<LeadFunnelSummary[]>('/api/v1/pharma/reports/lead-funnel').then((r) => r.data),
  })
}

export function useInvoiceAgingSummary() {
  return useQuery({
    queryKey: ['reports', 'invoice-aging'],
    queryFn: () =>
      client.get<InvoiceAgingSummary[]>('/api/v1/pharma/reports/invoice-aging').then((r) => r.data),
  })
}

export function useActivitySummary() {
  return useQuery({
    queryKey: ['reports', 'activities'],
    queryFn: () =>
      client.get<ActivitySummary[]>('/api/v1/pharma/reports/activities').then((r) => r.data),
  })
}

// ─── KPI endpoints ─────────────────────────────────────────────────────────────

export function useKpiCallSummary(period: KpiPeriod) {
  return useQuery({
    queryKey: ['kpi', 'call-summary', period],
    queryFn: () =>
      client
        .get<KpiCallSummaryRow[]>('/api/v1/pharma/reporting/kpi/call-summary', { params: period })
        .then((r) => r.data),
  })
}

export function useKpiActivitySummary(period: KpiPeriod) {
  return useQuery({
    queryKey: ['kpi', 'activity-summary', period],
    queryFn: () =>
      client
        .get<KpiActivitySummaryRow[]>('/api/v1/pharma/reporting/kpi/activity-summary', { params: period })
        .then((r) => r.data),
  })
}

export function useKpiDoctorCoverage(period: KpiPeriod) {
  return useQuery({
    queryKey: ['kpi', 'doctor-coverage', period],
    queryFn: () =>
      client
        .get<KpiDoctorCoverageRow[]>('/api/v1/pharma/reporting/kpi/doctor-coverage', { params: period })
        .then((r) => r.data),
  })
}

export function useKpiTerritoryPerformance(period: Pick<KpiPeriod, 'year' | 'quarter'>) {
  return useQuery({
    queryKey: ['kpi', 'territory-performance', period],
    queryFn: () =>
      client
        .get<KpiTerritoryPerformanceRow[]>('/api/v1/pharma/reporting/kpi/territory-performance', { params: period })
        .then((r) => r.data),
    enabled: !!period.quarter,
  })
}
