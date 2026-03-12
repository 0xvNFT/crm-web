import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeads } from '@/api/endpoints/leads'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { DataTable } from '@/components/shared/DataTable'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchInput } from '@/components/ui/search-input'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { formatDate } from '@/utils/formatters'
import type { PharmaLead } from '@/api/app-types'
import type { Column } from '@/components/shared/DataTable'

const LEAD_FILTERS: FilterDef[] = [
  { param: 'leadStatus', label: 'Status', configKey: 'lead.status' },
  { param: 'rating', label: 'Rating', configKey: 'lead.rating' },
]

const columns: Column<PharmaLead>[] = [
  { header: 'Lead Name', accessor: (row) => `${row.firstName ?? ''} ${row.lastName}`.trim() },
  { header: 'Company', accessor: (row) => row.companyName },
  { header: 'Status', accessor: (row) => <StatusBadge status={row.leadStatus ?? 'UNKNOWN'} /> },
  { header: 'Rating', accessor: (row) => row.rating ?? '—' },
  { header: 'Owner', accessor: (row) => row.assignedUser?.fullName },
  { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
]

export default function LeadListPage() {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [filters, setFilters] = useState<Record<string, string>>({})

  function handleFilterChange(param: string, value: string) {
    setFilters((prev) => ({ ...prev, [param]: value }))
    goToPage(0)
  }

  function handleFilterClear() {
    setFilters({})
    goToPage(0)
  }

  const { data, isLoading, isError } = useLeads(page, 20, filters)
  const leads = (data?.content ?? []).filter((row) => {
    const search = debouncedQuery.trim().toLowerCase()
    if (!search) return true
    const fullName = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim().toLowerCase()
    return fullName.includes(search) || (row.companyName ?? '').toLowerCase().includes(search)
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Potential customers and prospects"
      />
      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0) }}
        placeholder="Search by name…"
        className="max-w-sm"
      />
      <FilterBar
        filters={LEAD_FILTERS}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleFilterClear}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorMessage />
      ) : (
        <>
          <DataTable columns={columns} data={leads} onRowClick={(row) => navigate(`/leads/${row.id}`)} />
          <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
        </>
      )}
    </div>
  )
}