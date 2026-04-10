import { Skeleton } from '@/components/ui/skeleton'

interface ListPageSkeletonProps {
  /** Number of table rows to show. Defaults to 8. */
  rows?: number
  /** Number of columns. Defaults to 5. */
  columns?: number
}

export function ListPageSkeleton({ rows = 8, columns = 5 }: ListPageSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-9 w-72 rounded-lg" />

      {/* Table */}
      <div className="rounded-xl border bg-background overflow-hidden">
        {/* Header row */}
        <div className="border-b px-4 py-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-16" />
          ))}
        </div>
        {/* Data rows — alternating widths give a natural varied look */}
        {Array.from({ length: rows }).map((_, ri) => (
          <div
            key={ri}
            className="border-b last:border-0 px-4 py-3.5 grid gap-4"
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
