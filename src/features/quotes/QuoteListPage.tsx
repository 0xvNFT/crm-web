import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useQuotes, useQuoteSearch } from '@/api/endpoints/quotes'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { useRole } from '@/hooks/useRole'
import { useScopedLabel } from '@/hooks/useScopedLabel'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/utils/formatters'
import type { PharmaQuote } from '@/api/app-types'

const QUOTE_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'quote.status' },
]

const FILTER_KEYS = ['status']

const ALL_COLUMNS: Column<PharmaQuote>[] = [
  { header: 'Quote #',      accessor: (row) => <span className="font-medium text-foreground tabular-nums">{row.quoteNumber ?? '—'}</span> },
  { header: 'Account',      accessor: (row) => row.accountName ?? '—' },
  { header: 'Status',       accessor: (row) => row.status ? <StatusBadge status={row.status} /> : '—' },
  { header: 'Total',        accessor: (row) => <span className="tabular-nums">{row.totalAmount != null ? formatCurrency(row.totalAmount) : '—'}</span> },
  { header: 'Assigned Rep', accessor: (row) => row.assignedRepName ?? '—' },
  { header: 'Valid From',   accessor: (row) => <span className="text-muted-foreground tabular-nums">{row.validFrom ? formatDate(row.validFrom) : '—'}</span> },
  { header: 'Created',      accessor: (row) => <span className="text-muted-foreground tabular-nums">{row.createdAt ? formatDate(row.createdAt) : '—'}</span> },
]

export default function QuoteListPage() {
  const navigate = useNavigate()
  const { isManager } = useRole()
  const { title, emptyTitle, emptyDescription } = useScopedLabel('Quotes')
  const columns = isManager ? ALL_COLUMNS : ALL_COLUMNS.filter((c) => c.header !== 'Assigned Rep')
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useQuotes(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaQuote>(goToPage)
  const searchQuery = useQuoteSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        description="Sales quotes and proposals"
        actions={
          <Button size="sm" onClick={() => navigate('/quotes/new')} className="h-8 gap-1.5 text-xs font-medium">
            New Quote
          </Button>
        }
      />

      {/* Card surface */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search quotes…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={QUOTE_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'quote' : 'quotes'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/quotes/${row.id}`)}
          empty={isSearching
            ? { icon: FileText, title: `No quotes match "${query}"`, description: 'Try a different search term.' }
            : { icon: FileText, title: emptyTitle, description: emptyDescription }
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
