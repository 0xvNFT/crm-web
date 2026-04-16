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
    <div className={cn(
      'relative rounded-xl border border-border/60 bg-card px-5 pt-5 pb-4 flex flex-col gap-3 overflow-hidden',
      className
    )}>
      {/* top row: label + icon */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
          <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
        </span>
      </div>

      {/* value */}
      {loading ? (
        <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
      ) : (
        <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
      )}

      {/* trend */}
      {trend && !loading && (
        <p className={cn('text-xs font-medium', trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive')}>
          {trend}
        </p>
      )}

      {/* subtle bottom accent stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/12" />
    </div>
  )
}
