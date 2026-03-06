import { cn } from '@/lib/utils'

interface ErrorMessageProps {
  message?: string
  className?: string
}

export function ErrorMessage({ message = 'Something went wrong. Please try again.', className }: ErrorMessageProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <p className="text-sm text-destructive">{message}</p>
    </div>
  )
}
