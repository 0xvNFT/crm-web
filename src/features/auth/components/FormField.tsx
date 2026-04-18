import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string
  label?: string
  error?: string
  hint?: string
}

export function FormField({ id, label, error, hint, className, name, ...inputProps }: FormFieldProps) {
  const fieldId = id ?? name
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={fieldId} className="text-foreground/80">
          {label}
          {hint && (
            <span className="ml-1 font-normal text-muted-foreground text-xs">{hint}</span>
          )}
        </Label>
      )}
      <Input
        id={fieldId}
        name={name}
        aria-invalid={!!error}
        aria-describedby={error && fieldId ? `${fieldId}-error` : undefined}
        className={cn(error && 'border-destructive focus-visible:ring-destructive', className)}
        {...inputProps}
      />
      {error && (
        <p id={fieldId ? `${fieldId}-error` : undefined} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
