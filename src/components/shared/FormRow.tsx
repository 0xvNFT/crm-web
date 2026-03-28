import { Label } from '@/components/ui/label'

interface FormRowProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

/**
 * Standard form field wrapper used across all feature forms.
 * Renders a label, the field (children), and an optional error message.
 */
export function FormRow({ label, required, error, children, className }: FormRowProps) {
  return (
    <div className={`space-y-1 ${className ?? ''}`}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
