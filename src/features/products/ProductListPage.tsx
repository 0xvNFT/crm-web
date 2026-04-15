import { useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { useProducts, useProductSearch } from '@/api/endpoints/products'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { useRole } from '@/hooks/useRole'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/formatters'
import type { PharmaProduct } from '@/api/app-types'

const PRODUCT_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'product.status' },
]

const FILTER_KEYS = ['status']

const columns: Column<PharmaProduct>[] = [
  { header: 'Name',         accessor: 'name',        sortable: true, cell: (row) => <span className="font-medium text-foreground">{row.name ?? '—'}</span> },
  { header: 'NDC',          accessor: 'ndcNumber',   cell: (row) => <span className="text-muted-foreground tabular-nums">{row.ndcNumber ?? '—'}</span> },
  { header: 'Generic Name', accessor: (row) => row.genericName ?? '—' },
  { header: 'Strength',     accessor: (row) => row.strength ?? '—' },
  { header: 'Unit Price',   accessor: (row) => <span className="tabular-nums">{row.unitPrice != null ? formatCurrency(row.unitPrice) : '—'}</span> },
  { header: 'Status',       accessor: (row) => row.status ? <StatusBadge status={row.status} /> : '—' },
]

export default function ProductListPage() {
  const navigate = useNavigate()
  const { isAdmin } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useProducts(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaProduct>(goToPage)
  const searchQuery = useProductSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description="Product catalog"
        actions={
          isAdmin ? (
            <Button size="sm" onClick={() => navigate('/products/new')} className="h-8 gap-1.5 text-xs font-medium">
              New Product
            </Button>
          ) : undefined
        }
      />

      {/* Card surface */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search products…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={PRODUCT_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/products/${row.id}`)}
          empty={isSearching
            ? { icon: Package, title: `No products match "${query}"`, description: 'Try a different search term.' }
            : { icon: Package, title: 'No products yet', description: 'Products will appear here once created.' }
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
