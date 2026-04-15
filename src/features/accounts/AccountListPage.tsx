// REFERENCE PATTERN — Interns: copy this structure for your own feature list pages
import { useNavigate } from 'react-router-dom'
import { Plus, Building2 } from 'lucide-react'
import { useAccounts, useAccountSearch } from '@/api/endpoints/accounts'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { useRole } from '@/hooks/useRole'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { formatDate, formatLabel } from '@/utils/formatters'
import type { PharmaAccount } from '@/api/app-types'

const ACCOUNT_FILTERS: FilterDef[] = [
  { param: 'accountType', label: 'Type', configKey: 'account.type' },
  { param: 'status', label: 'Status', configKey: 'account.status' },
]

const columns: Column<PharmaAccount>[] = [
  {
    header: 'Name',
    accessor: 'name',
    sortable: true,
    cell: (row) => (
      <span className="font-medium text-foreground">{row.name ?? '—'}</span>
    ),
  },
  { header: 'Type', accessor: 'accountType', sortable: true, cell: (row) => formatLabel(row.accountType) },
  {
    header: 'Phone',
    accessor: 'phoneMain',
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">{row.phoneMain ?? '—'}</span>
    ),
  },
  { header: 'Status', accessor: (row) => <StatusBadge status={row.status ?? 'unknown'} /> },
  {
    header: 'Created',
    accessor: (row) => (
      <span className="text-muted-foreground tabular-nums">{formatDate(row.createdAt)}</span>
    ),
  },
]

const FILTER_KEYS = ['accountType', 'status']

export default function AccountListPage() {
  const navigate = useNavigate()
  const { isReadOnly } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useAccounts(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaAccount>(goToPage)
  const searchQuery = useAccountSearch(debouncedQuery)
  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      {/* Page header — title + primary action */}
      <PageHeader
        title="Accounts"
        description="Manage your pharmaceutical accounts"
        actions={
          !isReadOnly ? (
            <Button size="sm" onClick={() => navigate('/accounts/new')} className="h-8 gap-1.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New Account
            </Button>
          ) : undefined
        }
      />

      {/* Card surface — toolbar + table + footer */}
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search by name…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={ACCOUNT_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'account' : 'accounts'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/accounts/${row.id}`)}
          empty={isSearching
            ? { icon: Building2, title: `No accounts match "${query}"`, description: 'Try a different search term.' }
            : { icon: Building2, title: 'No accounts yet', description: 'Add your first account to get started.' }
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
