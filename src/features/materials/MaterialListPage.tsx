import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useMaterials, useMaterialSearch } from '@/api/endpoints/materials'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { SearchInput } from '@/components/ui/search-input'
import { formatDate } from '@/utils/formatters'
import type { PharmaMaterial } from '@/api/app-types'

const MATERIAL_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'material.status' },
]

const FILTER_KEYS = ['status']

const columns: Column<PharmaMaterial>[] = [
  { header: 'Title',        accessor: 'title',       sortable: true, cell: (row) => <span className="font-medium text-foreground">{row.title ?? '—'}</span> },
  { header: 'Category',     accessor: (row) => row.category ?? '—' },
  { header: 'Version',      accessor: (row) => row.versionNumber ?? '—' },
  { header: 'Owner',        accessor: (row) => row.ownerName ?? '—' },
  { header: 'Publish Date', accessor: (row) => <span className="text-muted-foreground tabular-nums">{row.publishDate ? formatDate(row.publishDate) : '—'}</span> },
  { header: 'Current',      accessor: (row) => row.isCurrent ? 'Yes' : 'No' },
  { header: 'Status',       accessor: (row) => row.status ? <StatusBadge status={row.status} /> : '—' },
]

export default function MaterialListPage() {
  const navigate = useNavigate()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaMaterial>(goToPage)

  const listQuery   = useMaterials(page, 20, filters)
  const searchQuery = useMaterialSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Materials"
        description="Sales and training materials library"
      />

      {/* Card surface */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by title…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={MATERIAL_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'material' : 'materials'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/materials/${row.id}`)}
          empty={isSearching
            ? { icon: FileText, title: `No materials match "${query}"`, description: 'Try a different search term.' }
            : { icon: FileText, title: 'No materials found', description: 'No materials match the current filters.' }
          }
        />

        {/* Footer — pagination */}
        {!isSearching && totalPages > 1 && (
          <div className="border-t border-border/40 px-4">
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </div>
        )}
      </div>
    </div>
  )
}
