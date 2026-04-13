import { cn } from '@/lib/utils'
import axios from 'axios'
import { ShieldOff, ServerCrash, WifiOff, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorMessageProps {
  message?: string
  error?: unknown
  className?: string
  onRetry?: () => void
}

export function ErrorMessage({ message, error, className, onRetry }: ErrorMessageProps) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    if (status === 403) {
      return (
        <div className={cn('flex flex-col items-center justify-center p-12 text-center gap-3', className)}>
          <ShieldOff className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Access Denied</p>
            <p className="text-sm text-muted-foreground">You don't have permission to view this.</p>
          </div>
        </div>
      )
    }

    if (status !== undefined && status >= 500) {
      return (
        <div className={cn('flex flex-col items-center justify-center p-12 text-center gap-4', className)}>
          <ServerCrash className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Server Error</p>
            <p className="text-sm text-muted-foreground">
              Something went wrong on our end. This has been logged and we're looking into it.
            </p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )
    }

    if (!error.response) {
      return (
        <div className={cn('flex flex-col items-center justify-center p-12 text-center gap-4', className)}>
          <WifiOff className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Connection Problem</p>
            <p className="text-sm text-muted-foreground">
              Unable to reach the server. Check your connection and try again.
            </p>
          </div>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )
    }
  }

  // Generic fallback — explicit message or unknown error
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center gap-4', className)}>
      <AlertTriangle className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Something went wrong</p>
        <p className="text-sm text-muted-foreground">
          {message ?? 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
