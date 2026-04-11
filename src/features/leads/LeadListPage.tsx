import { useState } from 'react'
import { Users, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLeads, useLeadSearch } from '@/api/endpoints/leads'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/useDebounce'
import { useListParams } from '@/hooks/useListParams'
import { useRole } from '@/hooks/useRole'
import { useScopedLabel } from '@/hooks/useScopedLabel'
import { formatDate } from '@/utils/formatters'
import type { PharmaLead } from '@/api/app-types'

const LEAD_FILTERS: FilterDef[] = [
  { param: 'leadStatus', label: 'Status', configKey: 'lead.status' },
  { param: 'rating', label: 'Rating', configKey: 'lead.rating' },
]

const FILTER_KEYS = ['leadStatus', 'rating']

const ALL_COLUMNS: Column<PharmaLead>[] = [
  { header: 'Lead Name', accessor: (row) => `${row.firstName ?? ''} ${row.lastName}`.trim() },
  { header: 'Company', accessor: (row) => row.companyName },
  { header: 'Status', accessor: (row) => <StatusBadge status={row.leadStatus ?? 'unknown'} /> },
  { header: 'Rating', accessor: (row) => row.rating ?? '—' },
  { header: 'Owner', accessor: (row) => row.assignedUserName ?? '—' },
  { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
]

export default function LeadListPage() {
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()
  const { title, emptyTitle, emptyDescription } = useScopedLabel('Leads')
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const columns = isManager ? ALL_COLUMNS : ALL_COLUMNS.filter((c) => c.header !== 'Owner')
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery = useLeads(page, 20, filters)
  const searchQuery = useLeadSearch(debouncedQuery)

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const error = isSearching ? searchQuery.error : listQuery.error
  const data: PharmaLead[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader
          title={title}
          description="Potential customers and prospects"
        />
        {!isReadOnly && (
          <Button onClick={() => navigate('/leads/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Lead
          </Button>
        )}
      </div>
      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0) }}
        placeholder="Search by name…"
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={LEAD_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/leads/${row.id}`)}
        empty={isSearching
          ? { icon: Users, title: `No leads found for "${debouncedQuery}"`, description: 'Try a different search term.' }
          : { icon: Users, title: emptyTitle, description: emptyDescription }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
