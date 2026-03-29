import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, type, onKeyDown, ...props }: InputProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // Prevent 'e' (exponential notation) and '-' (negative) on number inputs
    if (type === 'number' && (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+')) {
      e.preventDefault()
    }
    onKeyDown?.(e)
  }

  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    />
  )
}
