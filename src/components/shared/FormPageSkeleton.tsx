import { Skeleton } from '@/components/ui/skeleton'

interface FormPageSkeletonProps {
  /** Number of form section panels to show. Defaults to 2. */
  sections?: number
  /** Number of field rows per section. Defaults to 4. */
  fieldsPerSection?: number
}

export function FormPageSkeleton({ sections = 2, fieldsPerSection = 4 }: FormPageSkeletonProps) {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      {/* Back button + page header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Form sections */}
      {Array.from({ length: sections }).map((_, si) => (
        <div key={si} className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: fieldsPerSection }).map((_, fi) => (
              <div key={fi} className="space-y-1.5">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer — mirrors sticky footer layout */}
      <div className="flex items-center justify-end gap-2 border-t border-border/50 pt-3">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
    </div>
  )
}
