import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  children: ReactNode
  className?: string
  /** Override the default 2-column grid on children container */
  gridClassName?: string
  /** Skip the grid wrapper — use when children manage their own layout */
  noGrid?: boolean
}

export function FormSection({ title, children, className, gridClassName, noGrid }: FormSectionProps) {
  return (
    <div className={cn('rounded-xl border border-border/60 bg-card p-5 space-y-4', className)}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      {noGrid
        ? children
        : <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', gridClassName)}>{children}</div>
      }
    </div>
  )
}
