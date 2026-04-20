import { useId } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface SwitchFieldProps {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  disabled?: boolean
  error?: string
  /** Extra wrapper className — use for grid span overrides, e.g. "sm:col-span-2" */
  className?: string
}

/**
 * Switch + label compound for boolean toggles inside FormSection grids.
 * Must be used with Controller — Switch is a controlled Radix component.
 *
 * Usage:
 *   <Controller name="emailOptOut" control={control} render={({ field }) => (
 *     <SwitchField label="Email Opt-Out" checked={field.value ?? false} onCheckedChange={field.onChange} />
 *   )} />
 */
export function SwitchField({ label, checked, onCheckedChange, id, disabled, error, className }: SwitchFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn('flex flex-col gap-1 justify-center pt-1', className)}>
      <div className="flex items-center gap-3">
        <Switch
          id={inputId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
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
