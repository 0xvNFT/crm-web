import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { LeadFunnelSummary } from '@/api/app-types'
import { ChartCard } from '@/components/shared/ChartCard'

interface LeadFunnelChartProps {
  data: LeadFunnelSummary[] | undefined
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry?: () => void
}

// Ordered funnel stages with display labels
const STAGE_ORDER = ['NEW', 'ASSIGNED', 'IN_PROCESS', 'CONVERTED', 'LOST']
const STAGE_LABELS: Record<string, string> = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROCESS: 'In Progress',
  CONVERTED: 'Converted',
  LOST: 'Lost',
}
// Opacity steps to give a funnel feel
const STAGE_OPACITY = [1, 0.85, 0.7, 0.55, 0.4]

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  color: 'var(--color-foreground)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

export function LeadFunnelChart({ data, isLoading, isError, error, onRetry }: LeadFunnelChartProps) {
  const sorted = data
    ? STAGE_ORDER
        .map((stage) => {
          const match = data.find((d) => d.leadStatus?.toUpperCase() === stage)
          return { stage, label: STAGE_LABELS[stage] ?? stage, count: match?.count ?? 0 }
        })
        .filter((d) => d.count > 0)
    : []

  return (
    <ChartCard
      title="Lead Funnel"
      description="Lead counts by current status"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      isEmpty={!!data && sorted.length === 0}
      emptyMessage="No leads yet."
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          layout="vertical"
          data={sorted}
          margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip
            formatter={(value) => [Number(value), 'Leads']}
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {sorted.map((_, i) => (
              <Cell
                key={i}
                fill={`color-mix(in srgb, var(--color-primary) ${Math.round(STAGE_OPACITY[i] * 100)}%, transparent)`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
