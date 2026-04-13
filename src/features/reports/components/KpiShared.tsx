import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CURRENT_YEAR, MONTHS, QUARTERS } from './kpi-constants'

// ─── KPI indicator ────────────────────────────────────────────────────────────

interface KpiBadgeProps {
  value: number
  target: number
  noTarget?: boolean
}

export function KpiBadge({ value, target, noTarget }: KpiBadgeProps) {
  if (noTarget) {
    return <span className="text-xs text-muted-foreground font-medium">No target set</span>
  }
  const pct = Math.round(value)
  const isGreen = pct >= target
  const isYellow = !isGreen && pct >= target - 10

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        isGreen  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'  : '',
        isYellow ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : '',
        !isGreen && !isYellow ? 'bg-destructive/10 text-destructive' : '',
      ].join(' ')}
    >
      {pct}%
    </span>
  )
}

// ─── Shared section wrapper ────────────────────────────────────────────────────

interface KpiSectionProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  isLoading?: boolean
}

export function KpiSection({ title, icon: Icon, children, isLoading }: KpiSectionProps) {
  return (
    <div className="rounded-xl border bg-background overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      {isLoading ? (
        <div className="py-10"><LoadingSpinner /></div>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </div>
  )
}

// ─── Period selector ──────────────────────────────────────────────────────────

interface PeriodSelectorProps {
  year: number
  month: number
  onYearChange: (y: number) => void
  onMonthChange: (m: number) => void
  quarter?: number
  onQuarterChange?: (q: number) => void
}

export function PeriodSelector({ year, month, quarter, onYearChange, onMonthChange, onQuarterChange }: PeriodSelectorProps) {
  const years = [CURRENT_YEAR - 1, CURRENT_YEAR]
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Year</span>
        <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger className="h-8 w-24 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Month</span>
        <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
          <SelectTrigger className="h-8 w-32 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((name, i) => <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {quarter !== undefined && onQuarterChange && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Quarter</span>
          <Select value={String(quarter)} onValueChange={(v) => onQuarterChange(Number(v))}>
            <SelectTrigger className="h-8 w-28 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {QUARTERS.map((name, i) => <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
