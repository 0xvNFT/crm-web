import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ActivitySummary } from '@/api/app-types'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

interface ActivityChartProps {
  data: ActivitySummary[] | undefined
  isLoading: boolean
  isError: boolean
  error?: unknown
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

export function ActivityChart({ data, isLoading, isError, error }: ActivityChartProps) {
  const chartData = data ? aggregateByType(data) : []

  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Activity Breakdown</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Total activities by type</p>
      </div>

      {isLoading && <LoadingSpinner className="py-10" />}
      {isError && <ErrorMessage className="py-10" error={error} />}

      {data && chartData.length === 0 && (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-muted-foreground">No activities yet.</p>
        </div>
      )}

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [Number(value), formatType(String(name ?? ''))]}
              contentStyle={{
                fontSize: 12,
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-foreground)',
              }}
            />
            <Legend
              formatter={(value) => formatType(value)}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: 'var(--color-muted-foreground)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
