import type { ElementType, ReactNode } from 'react'

// ─── DetailSection ─────────────────────────────────────────────────────────────
// Grid-layout card panel. Used on most detail pages for attribute groups.

interface DetailSectionProps {
  title: string
  /** Optional Lucide icon component rendered inline with the title */
  icon?: ElementType
  children: ReactNode
  /** Override the default 2-column grid on the children container */
  gridClassName?: string
  /** Skip the grid wrapper — caller is responsible for layout (e.g. VisitDetailPage) */
  noGrid?: boolean
}

export function DetailSection({ title, icon: Icon, children, gridClassName, noGrid }: DetailSectionProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />}
        {title}
      </h2>
      {noGrid
        ? children
        : <div className={gridClassName ?? 'grid grid-cols-1 gap-4 sm:grid-cols-2'}>{children}</div>
      }
    </div>
  )
}

// ─── DetailField ───────────────────────────────────────────────────────────────
// Label/value pair for use inside DetailSection grids.

interface DetailFieldProps {
  label: string
  value?: string | number | boolean | null
}

export function DetailField({ label, value }: DetailFieldProps) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : String(value)

  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  )
}

// ─── DetailRow ─────────────────────────────────────────────────────────────────
// Definition-list row. Used on pages that display key-value pairs in a
// single-column list (e.g. OrderDetailPage, InvoiceDetailPage).
// Wrap multiple DetailRows in a <dl> inside a <DlSection>.

interface DetailRowProps {
  label: string
  value: ReactNode
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="col-span-2 text-sm">{value ?? '—'}</dd>
    </div>
  )
}

// ─── DlSection ─────────────────────────────────────────────────────────────────
// Card panel that wraps a <dl> of DetailRows.

interface DlSectionProps {
  title: string
  children: ReactNode
}

export function DlSection({ title, children }: DlSectionProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <dl>{children}</dl>
    </div>
  )
}
