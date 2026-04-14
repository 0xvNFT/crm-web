import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaWithCounterProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number
}

/**
 * Textarea atom with an inline character counter.
 * Drop-in replacement for `<Textarea maxLength={N}>` — same visual style,
 * same RHF `{...register()}` / `{...field}` compatibility.
 *
 * Usage:
 *   <TextareaWithCounter {...register('notes')} maxLength={2000} rows={3} />
 *
 * Counter only renders when `maxLength` is provided.
 * Warns (amber) at 90% usage, errors (red) at 100%.
 */
export const TextareaWithCounter = forwardRef<
  HTMLTextAreaElement,
  TextareaWithCounterProps
>(function TextareaWithCounter(
  { className, maxLength, onChange, defaultValue, value, ...props },
  ref
) {
  const controlled = value !== undefined
  const [length, setLength] = useState<number>(() => {
    const initial = controlled ? String(value ?? '') : String(defaultValue ?? '')
    return initial.length
  })

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setLength(e.target.value.length)
    onChange?.(e)
  }

  const remaining = maxLength != null ? maxLength - length : null
  const pct = maxLength != null ? length / maxLength : 0
  const counterColor =
    pct >= 1
      ? 'text-destructive'
      : pct >= 0.9
        ? 'text-amber-500'
        : 'text-muted-foreground'

  return (
    <div className="relative">
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          'disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          maxLength != null && 'pb-6',
          className
        )}
        maxLength={maxLength}
        onChange={handleChange}
        value={controlled ? value : undefined}
        defaultValue={!controlled ? defaultValue : undefined}
        {...props}
      />
      {maxLength != null && (
        <span
          className={cn(
            'absolute bottom-1.5 right-2.5 text-xs tabular-nums select-none pointer-events-none',
            counterColor
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {remaining} / {maxLength}
        </span>
      )}
    </div>
  )
})
