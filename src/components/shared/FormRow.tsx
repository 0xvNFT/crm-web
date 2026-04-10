import React, { useId } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormRowProps {
  label: string
  required?: boolean
  error?: string
  /** Pass fieldId when children is a native input so the label is programmatically associated. */
  fieldId?: string
  children: React.ReactNode
  className?: string
}

/**
 * Standard form field wrapper used across all feature forms.
 * Renders a label, the field (children), and an optional error message.
 *
 * For native inputs: pass the input's id as `fieldId` so the label is linked via htmlFor.
 * For Controller-wrapped components (Select, Combobox): omit fieldId — they manage their own focus.
 */
export function FormRow({ label, required, error, fieldId, children, className }: FormRowProps) {
  const generatedId = useId()
  const id = fieldId ?? generatedId

  return (
    <div className={cn('space-y-1', className)}>
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {/* Pass aria-describedby to native inputs via cloneElement when an error exists */}
      {error && fieldId
        ? React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            'aria-describedby': `${id}-error`,
            'aria-invalid': true,
          })
        : children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
