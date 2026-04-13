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
  { header: 'Name', accessor: 'name', sortable: true },
  { header: 'NDC', accessor: 'ndcNumber' },
  { header: 'Generic Name', accessor: (row) => row.genericName ?? '—' },
  { header: 'Strength', accessor: (row) => row.strength ?? '—' },
  { header: 'Unit Price', accessor: (row) => row.unitPrice != null ? formatCurrency(row.unitPrice) : '—' },
  { header: 'Status', accessor: (row) => row.status ? <StatusBadge status={row.status} /> : '—' },
]

export default function ProductListPage() {
  const navigate = useNavigate()
  const { isAdmin } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useProducts(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaProduct>(goToPage)
  const searchQuery = useProductSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Product catalog"
        actions={
          isAdmin ? (
            <Button onClick={() => navigate('/products/new')}>New Product</Button>
          ) : undefined
        }
      />
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search products..."
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={PRODUCT_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/products/${row.id}`)}
        empty={isSearching
          ? { icon: Package, title: `No products found for "${query}"`, description: 'Try a different search term.' }
          : { icon: Package, title: 'No products yet', description: 'Products will appear here once created.' }
        }
        totalElements={totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
