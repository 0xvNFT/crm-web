import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type DateTimeInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

/**
 * Styled datetime-local input atom — visually identical to `Input` but locked to
 * `type="datetime-local"`. Outputs a local datetime string compatible with Spring Boot's
 * `LocalDateTime` fields (e.g. "2026-04-17T09:30").
 *
 * Color-scheme is inherited from `:root` / `.dark` in index.css — the native calendar
 * and clock icons automatically match the active theme.
 */
export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  function DateTimeInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="datetime-local"
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm',
          'transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
