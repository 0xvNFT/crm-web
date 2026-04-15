import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn('flex items-center justify-between px-1 py-3', className)}>
      <p className="text-xs text-muted-foreground">
        Page {page + 1} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent hover:text-foreground hover:border-border"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent hover:text-foreground hover:border-border"
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}
