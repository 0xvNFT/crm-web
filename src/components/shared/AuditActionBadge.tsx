// ─── Audit action badge — shared between AuditLogPage and EntityHistorySection ─
// Palette: industry-standard (Salesforce / HubSpot audit trail style)
const ACTION_STYLES: Record<string, string> = {
  CREATE:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  UPDATE:  'bg-blue-50   text-blue-700   border border-blue-200',
  DELETE:  'bg-red-50    text-red-700    border border-red-200',
  APPROVE: 'bg-violet-50 text-violet-700 border border-violet-200',
  REJECT:  'bg-rose-50   text-rose-700   border border-rose-200',
  SUBMIT:  'bg-amber-50  text-amber-700  border border-amber-200',
  CANCEL:  'bg-zinc-100  text-zinc-600   border border-zinc-200',
  SHIP:    'bg-sky-50    text-sky-700    border border-sky-200',
  DELIVER: 'bg-teal-50   text-teal-700   border border-teal-200',
  VOID:    'bg-zinc-100  text-zinc-500   border border-zinc-200',
}

interface AuditActionBadgeProps {
  action: string
  /** Add whitespace-nowrap — useful in table cells where wrapping breaks layout */
  nowrap?: boolean
}

export function AuditActionBadge({ action, nowrap = false }: AuditActionBadgeProps) {
  const cls = ACTION_STYLES[action.toUpperCase()] ?? 'bg-muted text-muted-foreground border border-border'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${nowrap ? 'whitespace-nowrap' : ''} ${cls}`}
    >
      {action}
    </span>
  )
}
