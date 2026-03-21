import { cn } from '@/lib/utils'
import axios from 'axios'
import { ShieldOff } from 'lucide-react'

interface ErrorMessageProps {
  message?: string
  error?: unknown
  className?: string
}

export function ErrorMessage({ message, error, className }: ErrorMessageProps) {
  const is403 = axios.isAxiosError(error) && error.response?.status === 403

  if (is403) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-12 text-center gap-3', className)}>
        <ShieldOff className="w-10 h-10 text-muted-foreground/50" strokeWidth={1.5} />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Access Denied</p>
          <p className="text-sm text-muted-foreground">You don't have permission to view this.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <p className="text-sm text-destructive">{message ?? 'Something went wrong. Please try again.'}</p>
    </div>
  )
}
