import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div role="status" aria-label="Loading" className={cn('flex items-center justify-center w-full h-full', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" aria-hidden="true" />
    </div>
  )
}
