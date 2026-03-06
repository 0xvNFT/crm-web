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
  // Negative
  REJECTED: 'destructive',
  UNQUALIFIED: 'destructive',
  EXPIRED: 'destructive',
  CANCELLED: 'destructive',
  LOST: 'destructive',
  INACTIVE: 'destructive',
  // Neutral
  NEW: 'default',
  DRAFT: 'secondary',
  UNAWARE: 'secondary',
  AWARE: 'secondary',
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  destructive: 'bg-red-100 text-red-800 border-red-200',
  secondary: 'bg-gray-100 text-gray-700 border-gray-200',
  default: 'bg-blue-100 text-blue-800 border-blue-200',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_MAP[status] ?? 'default'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')}
    </span>
  )
}
