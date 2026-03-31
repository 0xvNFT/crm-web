// REFERENCE PATTERN — Interns: copy this structure for your own feature list pages
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2 } from 'lucide-react'
import { useAccounts, useAccountSearch } from '@/api/endpoints/accounts'
import { useListParams } from '@/hooks/useListParams'
import { useDebounce } from '@/hooks/useDebounce'
import { useRole } from '@/hooks/useRole'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { formatDate, formatLabel } from '@/utils/formatters'
import type { PharmaAccount } from '@/api/app-types'

const ACCOUNT_FILTERS: FilterDef[] = [
  { param: 'accountType', label: 'Type', configKey: 'account.type' },
  { param: 'status', label: 'Status', configKey: 'account.status' },
]

const columns: Column<PharmaAccount>[] = [
  { header: 'Name', accessor: 'name', sortable: true, cell: (row) => row.name ?? '—' },
  { header: 'Type', accessor: 'accountType', sortable: true, cell: (row) => formatLabel(row.accountType) },
  { header: 'Phone', accessor: 'phoneMain', cell: (row) => row.phoneMain ?? '—' },
  { header: 'Status', accessor: (row) => <StatusBadge status={row.status ?? 'UNKNOWN'} /> },
  { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
]

const FILTER_KEYS = ['accountType', 'status']

export default function AccountListPage() {
  const navigate = useNavigate()
  const { isManager } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery = useAccounts(page, 20, filters)
  const searchQuery = useAccountSearch(debouncedQuery)

  function handleFilterChange(param: string, value: string) {
    setFilter(param, value)
  }

  function handleFilterClear() {
    clearFilters()
  }

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const error = isSearching ? searchQuery.error : listQuery.error
  const data: PharmaAccount[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <LoadingSpinner />
  if (isError) return <ErrorMessage error={error} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Accounts"
        description="Manage your pharmaceutical accounts"
        actions={isManager ? (
          <Button size="sm" onClick={() => navigate('/accounts/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Account
          </Button>
        ) : undefined}
      />
      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0) }}
        placeholder="Search by name…"
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={ACCOUNT_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/accounts/${row.id}`)}
        empty={isSearching
          ? { icon: Building2, title: `No accounts found for "${debouncedQuery}"`, description: 'Try a different search term.' }
          : { icon: Building2, title: 'No accounts yet', description: 'Add your first account to get started.' }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
