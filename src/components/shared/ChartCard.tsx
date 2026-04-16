import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'

interface ChartCardProps {
  title: string
  description?: string
  /** Rendered below the header, above the chart body — e.g. a summary strip */
  footer?: ReactNode
  isLoading?: boolean
  isError?: boolean
  error?: unknown
  onRetry?: () => void
  emptyMessage?: string
  /** True when the data set is empty (after loading). Renders emptyMessage instead of children. */
  isEmpty?: boolean
  children?: ReactNode
  className?: string
  /** Override the minimum height used for loading/empty/error states. Default: "py-14" */
  placeholderClassName?: string
}

export function ChartCard({
  title,
  description,
  footer,
  isLoading,
  isError,
  error,
  onRetry,
  emptyMessage = 'No data yet.',
  isEmpty,
  children,
  className,
  placeholderClassName = 'py-14',
}: ChartCardProps) {
  return (
    <div className={cn('rounded-xl border border-border/60 bg-card p-5', className)}>
      {/* header */}
      <div className="mb-5 flex flex-col gap-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* states */}
      {isLoading && (
        <div className={cn('flex items-center justify-center', placeholderClassName)}>
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && isError && (
        <ErrorMessage className={placeholderClassName} error={error} onRetry={onRetry} />
      )}
      {!isLoading && !isError && isEmpty && (
        <div className={cn('flex items-center justify-center', placeholderClassName)}>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )}

      {/* chart body — only rendered when loaded, no error, not empty */}
      {!isLoading && !isError && !isEmpty && children}

      {/* optional footer strip */}
      {!isLoading && !isError && !isEmpty && footer && (
        <div className="mt-4 border-t border-border/40 pt-4">{footer}</div>
      )}
    </div>
  )
}
