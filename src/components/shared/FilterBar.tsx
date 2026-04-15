import { useMemo } from 'react'
import { X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { cn } from '@/lib/utils'

export interface FilterDef {
  param: string       // query param name sent to backend (e.g. 'accountType', 'status')
  label: string       // display label (e.g. 'Type', 'Status')
  configKey: string   // key into GET /api/pharma/config (e.g. 'account.type')
}

interface FilterSelectProps {
  def: FilterDef
  value: string
  onChange: (v: string) => void
}

function FilterSelect({ def, value, onChange }: FilterSelectProps) {
  const options = useConfigOptions(def.configKey)
  const isActive = value !== ''
  return (
    <Select value={value || '__all__'} onValueChange={(v) => onChange(v === '__all__' ? '' : v)}>
      <SelectTrigger className={cn(
        'h-8 text-xs w-[130px] transition-colors',
        isActive
          ? 'border-primary/40 bg-primary/5 text-primary font-medium'
          : 'border-border/60 bg-background text-muted-foreground hover:border-border hover:text-foreground'
      )}>
        <SelectValue placeholder={def.label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All {def.label}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface FilterBarProps {
  filters: FilterDef[]
  values: Record<string, string>
  onChange: (param: string, value: string) => void
  onClear: () => void
  className?: string
}

export function FilterBar({ filters, values, onChange, onClear, className }: FilterBarProps) {
  const hasActive = useMemo(() => Object.values(values).some((v) => v !== ''), [values])

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((f) => (
        <FilterSelect
          key={f.param}
          def={f}
          value={values[f.param] ?? ''}
          onChange={(v) => onChange(f.param, v)}
        />
      ))}
      {hasActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
        >
          <X className="h-3 w-3" strokeWidth={1.5} />
          Clear
        </Button>
      )}
    </div>
  )
}
