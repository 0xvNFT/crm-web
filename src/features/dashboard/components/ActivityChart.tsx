import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ActivitySummary } from '@/api/app-types'
import { ChartCard } from '@/components/shared/ChartCard'

interface ActivityChartProps {
  data: ActivitySummary[] | undefined
  isLoading: boolean
  isError: boolean
  error?: unknown
  onRetry?: () => void
}

// Aggregate by activityType (collapse status dimension for the donut)
function aggregateByType(data: ActivitySummary[]) {
  const map = new Map<string, number>()
  for (const item of data) {
    const type = item.activityType ?? 'Unknown'
    map.set(type, (map.get(type) ?? 0) + (item.count ?? 0))
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
}

function formatType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// Palette — primary shades at different opacities
const COLORS = [
  'var(--color-primary)',
  'hsl(231 48% 55%)',
  'hsl(231 48% 65%)',
  'hsl(231 48% 72%)',
  'hsl(231 48% 80%)',
  'hsl(231 30% 85%)',
]

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: '8px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-card)',
  color: 'var(--color-foreground)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
}

export function ActivityChart({ data, isLoading, isError, error, onRetry }: ActivityChartProps) {
  const chartData = data ? aggregateByType(data) : []

  return (
    <ChartCard
      title="Activity Breakdown"
      description="Total activities by type"
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={onRetry}
      isEmpty={!!data && chartData.length === 0}
      emptyMessage="No activities yet."
    >
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [Number(value), formatType(String(name ?? ''))]}
            contentStyle={TOOLTIP_STYLE}
          />
          <Legend
            formatter={(value) => formatType(value)}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
