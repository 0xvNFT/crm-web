import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label?: string
  error?: string
  hint?: string
}

export function FormField({ id, label, error, hint, className, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={id} className="text-foreground/80">
          {label}
          {hint && (
            <span className="ml-1 font-normal text-muted-foreground text-xs">{hint}</span>
          )}
        </Label>
      )}
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(error && 'border-destructive focus-visible:ring-destructive', className)}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
