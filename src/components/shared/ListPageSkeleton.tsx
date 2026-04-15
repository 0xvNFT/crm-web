import { Skeleton } from '@/components/ui/skeleton'

interface ListPageSkeletonProps {
  /** Number of table rows to show. Defaults to 8. */
  rows?: number
  /** Number of columns. Defaults to 5. */
  columns?: number
}

export function ListPageSkeleton({ rows = 8, columns = 5 }: ListPageSkeletonProps) {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Card surface */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-3">
          <Skeleton className="h-8 w-56 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>

        {/* Header row */}
        <div className="border-b border-border/60 bg-muted/30 px-4 py-2.5 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-14" />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: rows }).map((_, ri) => (
          <div
            key={ri}
            className="border-b border-border/40 last:border-0 px-4 py-3 grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, ci) => {
              const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-4/5', 'w-3/5']
              return <Skeleton key={ci} className={`h-4 ${widths[(ri + ci) % widths.length]}`} />
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
