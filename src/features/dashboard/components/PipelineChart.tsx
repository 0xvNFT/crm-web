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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

interface PipelineChartProps {
  data: PipelineSummary[] | undefined
  isLoading: boolean
  isError: boolean
}

function formatStage(stage: string) {
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatRevenue(value: number) {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `₱${(value / 1_000).toFixed(0)}K`
  return `₱${value}`
}

export function PipelineChart({ data, isLoading, isError }: PipelineChartProps) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Pipeline by Stage</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Estimated revenue across open opportunities</p>
      </div>

      {isLoading && <LoadingSpinner className="py-12" />}
      {isError && <ErrorMessage className="py-12" />}

      {data && data.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">No pipeline data yet.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={240}>
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
              formatter={(value) => [formatRevenue(Number(value) ?? 0), 'Est. Revenue']}
              labelFormatter={(label) => formatStage(String(label ?? ''))}
              contentStyle={{
                fontSize: 12,
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-foreground)',
              }}
              cursor={{ fill: 'var(--color-secondary)' }}
            />
            <Bar
              dataKey="totalEstRevenue"
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
