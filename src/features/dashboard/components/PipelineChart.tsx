import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { PipelineSummary } from '@/api/app-types'
import { ChartCard } from '@/components/shared/ChartCard'

interface PipelineChartProps {
  data: PipelineSummary[] | undefined
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry?: () => void
}

function formatStage(stage: string) {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatRevenue(value: number) {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}K`
  return `₱${value}`
}

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  color: 'var(--color-foreground)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

export function PipelineChart({ data, isLoading, isError, error, onRetry }: PipelineChartProps) {
  return (
    <ChartCard
      title="Pipeline by Stage"
      description="Estimated revenue across open opportunities"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      isEmpty={!!data && data.length === 0}
      emptyMessage="No pipeline data yet."
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="salesStage"
            tickFormatter={formatStage}
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatRevenue}
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            formatter={(value) => [formatRevenue(Number(value)), 'Est. Revenue']}
            labelFormatter={(label) => formatStage(String(label ?? ''))}
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
          />
          <Bar
            dataKey="totalEstRevenue"
            fill="var(--color-primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={52}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
