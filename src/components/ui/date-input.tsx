import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type DateInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

/**
 * Styled date input atom — visually identical to `Input` but locked to `type="date"`.
 * Outputs YYYY-MM-DD string, compatible with `dateField` in Zod schemas.
 *
 * Cross-browser note: the native date picker chrome (calendar popup) is OS-controlled
 * and cannot be fully overridden with CSS. This component ensures the text field area
 * matches the design system. For a fully custom calendar popover, a dedicated date
 * picker library would be needed — defer until explicitly requested.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="date"
        className={cn(
          // Match Input atom exactly
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm',
          'transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Ensure the browser date icon picks up the foreground color
          '[color-scheme:light] dark:[color-scheme:dark]',
          className
        )}
        {...props}
      />
    )
  }
)
