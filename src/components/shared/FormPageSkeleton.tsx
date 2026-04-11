import { Skeleton } from '@/components/ui/skeleton'

interface FormPageSkeletonProps {
  /** Number of form section panels to show. Defaults to 2. */
  sections?: number
  /** Number of field rows per section. Defaults to 4. */
  fieldsPerSection?: number
}

export function FormPageSkeleton({ sections = 2, fieldsPerSection = 4 }: FormPageSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {/* Back button + page header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Form sections */}
      {Array.from({ length: sections }).map((_, si) => (
        <div key={si} className="rounded-xl border bg-background p-5 space-y-4">
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

      {/* Footer buttons */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  )
}
