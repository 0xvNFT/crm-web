import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  loading?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  loading = false,
  className,
}: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-border/60 bg-card p-5 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </span>
      </div>

      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      )}

      {trend && !loading && (
        <p className={cn('text-xs font-medium', trendUp ? 'text-emerald-600' : 'text-destructive')}>
          {trend}
        </p>
      )}
    </div>
  )
}
