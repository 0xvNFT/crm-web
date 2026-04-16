import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { ChartCard } from '@/components/shared/ChartCard'
import { PipelineChart } from '@/features/dashboard/components/PipelineChart'
import { LeadFunnelChart } from '@/features/dashboard/components/LeadFunnelChart'
import { ActivityChart } from '@/features/dashboard/components/ActivityChart'
import {
  usePipelineSummary,
  useLeadFunnelSummary,
  useInvoiceAgingSummary,
  useActivitySummary,
} from '@/api/endpoints/reports'
import { useRole } from '@/hooks/useRole'
import type { InvoiceAgingSummary } from '@/api/app-types'

// ─── Invoice Aging Chart ────────────────────────────────────────────────────────
// Brackets: e.g. "0-30 days", "31-60 days", "61-90 days", "90+ days"
// Only used here — not on dashboard — so defined inline.

function formatAgingCurrency(value: number) {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}K`
  return `₱${value.toFixed(0)}`
}

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  color: 'var(--color-foreground)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

interface InvoiceAgingChartProps {
  data: InvoiceAgingSummary[] | undefined
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry?: () => void
}

function InvoiceAgingChart({ data, isLoading, isError, error, onRetry }: InvoiceAgingChartProps) {
  // Summary row shown in the ChartCard footer
  const footer = data && data.length > 0 ? (
    <div className="flex flex-wrap gap-5">
      {data.map((row) => (
        <div key={row.bracket} className="space-y-0.5">
          <p className="text-xs text-muted-foreground">{row.bracket}</p>
          <p className="text-sm font-medium text-foreground tabular-nums">
            {formatAgingCurrency(row.totalBalanceDue ?? 0)}
            <span className="ml-1 text-xs text-muted-foreground">
              ({row.invoiceCount} inv.)
            </span>
          </p>
        </div>
      ))}
    </div>
  ) : undefined

  return (
    <ChartCard
      title="Invoice Aging"
      description="Outstanding balance by age bracket"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      isEmpty={!!data && data.length === 0}
      emptyMessage="No outstanding invoices."
      footer={footer}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="bracket"
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAgingCurrency}
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            formatter={(value) => [formatAgingCurrency(Number(value)), 'Balance Due']}
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
          />
          <Bar
            dataKey="totalBalanceDue"
            fill="var(--color-destructive)"
            radius={[4, 4, 0, 0]}
            maxBarSize={52}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ─── Section label — matches DashboardPage pattern ──────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-0.5">
      {children}
    </p>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { isManager, isRep } = useRole()
  const isRepOnly = isRep && !isManager

  const pipeline = usePipelineSummary({ enabled: isManager })
  const leadFunnel = useLeadFunnelSummary()
  const invoiceAging = useInvoiceAgingSummary({ enabled: !isRepOnly })
  const activitySummary = useActivitySummary()

  const description = isManager
    ? 'Analytics and summaries across your field force'
    : 'Your activity analytics and lead pipeline'

  return (
    <div className="space-y-5">
      <PageHeader title="Reports" description={description} />

      {/* Pipeline — MANAGER/ADMIN only: org-level opportunity visibility */}
      {isManager && (
        <div className="space-y-3">
          <SectionLabel>Pipeline</SectionLabel>
          <PipelineChart
            data={pipeline.data}
            isLoading={pipeline.isLoading}
            isError={pipeline.isError}
            error={pipeline.error}
            onRetry={() => pipeline.refetch()}
          />
        </div>
      )}

      {/* Lead Funnel + Activity — all roles */}
      <div className="space-y-3">
        <SectionLabel>Leads &amp; Activity</SectionLabel>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <LeadFunnelChart
            data={leadFunnel.data}
            isLoading={leadFunnel.isLoading}
            isError={leadFunnel.isError}
            error={leadFunnel.error}
            onRetry={() => leadFunnel.refetch()}
          />
          <ActivityChart
            data={activitySummary.data}
            isLoading={activitySummary.isLoading}
            isError={activitySummary.isError}
            error={activitySummary.error}
            onRetry={() => activitySummary.refetch()}
          />
        </div>
      </div>

      {/* Invoice Aging — MANAGER/ADMIN only: financial data not relevant to reps */}
      {!isRepOnly && (
        <div className="space-y-3">
          <SectionLabel>Receivables</SectionLabel>
          <InvoiceAgingChart
            data={invoiceAging.data}
            isLoading={invoiceAging.isLoading}
            isError={invoiceAging.isError}
            error={invoiceAging.error}
            onRetry={() => invoiceAging.refetch()}
          />
        </div>
      )}
    </div>
  )
}
