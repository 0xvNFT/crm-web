import { useId } from 'react'
import { Checkbox, type CheckboxProps } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface CheckboxFieldProps extends CheckboxProps {
  label: string
  error?: string
  /** Extra wrapper className — use for grid span overrides, e.g. "sm:col-span-2" */
  className?: string
}

/**
 * Checkbox + label compound for use inside FormSection grids.
 * Replaces the repeated `div.flex.items-center.gap-2` + raw `<input type="checkbox">` pattern.
 *
 * Usage (with react-hook-form register):
 *   <CheckboxField label="Prescribing Authority" {...register('prescribingAuthority')} />
 *
 * Usage (with Controller for boolean fields needing explicit value):
 *   <Controller name="isActive" control={control} render={({ field }) => (
 *     <CheckboxField label="Active" checked={field.value} onChange={field.onChange} />
 *   )} />
 */
export function CheckboxField({ label, error, className, ...checkboxProps }: CheckboxFieldProps) {
  const id = useId()
  const inputId = checkboxProps.id ?? id

  return (
    <div className={cn('flex flex-col gap-1 justify-center pt-1', className)}>
      <div className="flex items-center gap-2">
        <Checkbox id={inputId} {...checkboxProps} />
        <Label
          htmlFor={inputId}
          className="text-sm text-foreground cursor-pointer font-normal leading-none"
        >
          {label}
        </Label>
      </div>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
