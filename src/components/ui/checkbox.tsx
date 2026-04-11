import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

/**
 * Styled checkbox atom — matches the design system (border-input, ring-ring, accent-primary).
 * Always use CheckboxField (shared) for the label+checkbox compound in forms.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'h-4 w-4 shrink-0 rounded border border-input bg-transparent',
          'accent-primary cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
