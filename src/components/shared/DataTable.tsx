import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  className?: string
  emptyMessage?: string
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
  className,
  emptyMessage = 'No records found.',
}: DataTableProps<T>) {
  return (
    <div className={cn('w-full overflow-auto rounded-md border', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th
                key={col.header}
                className={cn('px-4 py-3 text-left font-medium text-muted-foreground', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id ?? Math.random()}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b transition-colors hover:bg-muted/30',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col) => (
                  <td key={col.header} className={cn('px-4 py-3', col.className)}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : String(row[col.accessor] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
