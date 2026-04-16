import { Skeleton } from '@/components/ui/skeleton'

interface DetailPageSkeletonProps {
  /** Number of info sections below the header. Defaults to 2. */
  sections?: number
  /** Number of field rows per section. Defaults to 4. */
  fieldsPerSection?: number
}

export function DetailPageSkeleton({ sections = 2, fieldsPerSection = 4 }: DetailPageSkeletonProps) {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>

      {/* Info sections */}
      {Array.from({ length: sections }).map((_, si) => (
        <div key={si} className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
          <Skeleton className="h-3.5 w-28" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: fieldsPerSection }).map((_, fi) => (
              <div key={fi} className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
