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
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

interface LeadFunnelChartProps {
  data: LeadFunnelSummary[] | undefined
  isLoading: boolean
  isError: boolean
  error?: unknown
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

export function LeadFunnelChart({ data, isLoading, isError, error }: LeadFunnelChartProps) {
  const sorted = data
    ? STAGE_ORDER
        .map((stage) => {
          const match = data.find((d) => d.leadStatus?.toUpperCase() === stage)
          return { stage, label: STAGE_LABELS[stage] ?? stage, count: match?.count ?? 0 }
        })
        .filter((d) => d.count > 0)
    : []

  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Lead Funnel</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Lead counts by current status</p>
      </div>

      {isLoading && <LoadingSpinner className="py-10" />}
      {isError && <ErrorMessage className="py-10" error={error} />}

      {data && sorted.length === 0 && (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-muted-foreground">No leads yet.</p>
        </div>
      )}

      {sorted.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
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
              contentStyle={{
                fontSize: 12,
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-foreground)',
              }}
              cursor={{ fill: 'var(--color-secondary)' }}
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
      )}
    </div>
  )
}
