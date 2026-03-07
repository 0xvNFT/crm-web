import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState, type ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Public Column interface ───────────────────────────────────────────────────
// accessor  — keyof T (primitive, sortable) OR (row) => ReactNode (custom, not sortable)
// cell      — optional display override when accessor is keyof T but you want formatted output
//             e.g. accessor: 'contactType', cell: (row) => formatLabel(row.contactType)
// sortable  — opt-in, only works with keyof T accessor
export interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => ReactNode)
  cell?: (row: T) => ReactNode
  className?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  className?: string
  emptyMessage?: string
  totalElements?: number  // pass Page<T>.totalElements for "Showing X of Y" footer
}

function toColumnDef<T extends object>(col: Column<T>): ColumnDef<T> {
  const isAccessorFn = typeof col.accessor === 'function'

  return {
    id: col.header,
    header: col.header,
    accessorFn: isAccessorFn
      ? undefined
      : (row: T) => row[col.accessor as keyof T],
    cell: ({ row, getValue }) => {
      // Custom cell renderer takes priority
      if (col.cell) return col.cell(row.original)
      // Accessor function handles its own rendering
      if (isAccessorFn) return (col.accessor as (row: T) => ReactNode)(row.original)
      // Primitive accessor — stringify the value
      const v = getValue()
      return v === null || v === undefined || v === '' ? '—' : String(v)
    },
    enableSorting: col.sortable === true && !isAccessorFn,
    meta: { className: col.className },
  }
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  onRowClick,
  className,
  emptyMessage = 'No records found.',
  totalElements,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns: columns.map(toColumnDef) as ColumnDef<T>[],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
  })

  const rows = table.getRowModel().rows

  return (
    <div className={cn('w-full space-y-1', className)}>
      <div className="overflow-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/50">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const meta = header.column.columnDef.meta as { className?: string } | undefined

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-semibold text-muted-foreground',
                        canSort && 'cursor-pointer select-none hover:text-foreground transition-colors',
                        meta?.className
                      )}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <span className="text-muted-foreground/50">
                            {sorted === 'asc' ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : sorted === 'desc' ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronsUpDown className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </span>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'border-b transition-colors last:border-0 hover:bg-muted/40',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { className?: string } | undefined
                    return (
                      <td key={cell.id} className={cn('px-4 py-3', meta?.className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <p className="px-1 text-xs text-muted-foreground">
          {totalElements !== undefined
            ? `Showing ${rows.length} of ${totalElements} results`
            : `${rows.length} ${rows.length === 1 ? 'record' : 'records'}`}
        </p>
      )}
    </div>
  )
}
