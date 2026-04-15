import { cn } from '@/lib/utils'

type StatusVariant = 'success' | 'warning' | 'destructive' | 'secondary' | 'default'

const STATUS_MAP: Record<string, StatusVariant> = {
  // Positive
  ACTIVE: 'success',
  APPROVED: 'success',
  DELIVERED: 'success',
  ACCEPTED: 'success',
  CONVERTED: 'success',
  COMPLETED: 'success',
  VERIFIED: 'success',
  PAID: 'success',
  WON: 'success',
  CLOSED_WON: 'success',
  // Warning / in-progress
  PENDING: 'warning',
  PENDING_APPROVAL: 'warning',
  SENT: 'warning',
  SHIPPED: 'warning',
  CONTACTED: 'warning',
  QUALIFIED: 'warning',
  IN_PROGRESS: 'warning',
  IN_PROCESS: 'warning',
  ASSIGNED: 'warning',
  OVERDUE: 'warning',
  SCHEDULED: 'warning',
  PROCESSING: 'warning',
  SUBMITTED: 'warning',
  OPEN: 'warning',
  // Negative
  REJECTED: 'destructive',
  UNQUALIFIED: 'destructive',
  EXPIRED: 'destructive',
  CANCELLED: 'destructive',
  CANCELED: 'destructive',
  LOST: 'destructive',
  CLOSED_LOST: 'destructive',
  INACTIVE: 'destructive',
  VOID: 'destructive',
  // Neutral / initial state
  NEW: 'default',
  DRAFT: 'secondary',
  UNAWARE: 'secondary',
  AWARE: 'secondary',
  ARCHIVED: 'secondary',
  PROSPECTING: 'secondary',
  PLANNED: 'secondary',
  AVAILABLE: 'success',
  QUARANTINED: 'warning',
  DEPLETED: 'destructive',
  TRIALING: 'warning',
  PAST_DUE: 'destructive',
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-green-50 text-green-700 border-green-200/80 ring-green-500/20',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-500/20',
  destructive: 'bg-red-50 text-red-700 border-red-200/80 ring-red-500/20',
  secondary: 'bg-zinc-50 text-zinc-600 border-zinc-200/80 ring-zinc-500/10',
  default: 'bg-blue-50 text-blue-700 border-blue-200/80 ring-blue-500/20',
}

const DOT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  destructive: 'bg-red-500',
  secondary: 'bg-zinc-400',
  default: 'bg-blue-500',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/ /g, '_')
  const variant = STATUS_MAP[normalized] ?? 'default'
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', DOT_CLASSES[variant])} />
      {label}
    </span>
  )
}
