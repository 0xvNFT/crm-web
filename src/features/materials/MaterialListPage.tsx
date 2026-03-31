import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useMaterials } from '@/api/endpoints/materials'
import { useListParams } from '@/hooks/useListParams'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { formatDate } from '@/utils/formatters'
import type { PharmaMaterial } from '@/api/app-types'

const MATERIAL_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'material.status' },
]

const FILTER_KEYS = ['status']

const columns: Column<PharmaMaterial>[] = [
  { header: 'Title', accessor: 'title', sortable: true },
  { header: 'Category', accessor: (row) => row.category ?? '—' },
  { header: 'Version', accessor: (row) => row.versionNumber ?? '—' },
  { header: 'Owner', accessor: (row) => row.ownerName ?? '—' },
  { header: 'Publish Date', accessor: (row) => row.publishDate ? formatDate(row.publishDate) : '—' },
  { header: 'Current', accessor: (row) => row.isCurrent ? 'Yes' : 'No' },
  {
    header: 'Status',
    accessor: (row) => row.status ? <StatusBadge status={row.status} /> : '—',
  },
]

export default function MaterialListPage() {
  const navigate = useNavigate()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const { data, isLoading, isError, error } = useMaterials(page, 20, filters)

  function handleFilterChange(param: string, value: string) { setFilter(param, value) }
  function handleFilterClear() { clearFilters() }

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage error={error} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Materials"
        description="Sales and training materials library"
      />

      <FilterBar
        filters={MATERIAL_FILTERS}
        values={filters}
        onChange={handleFilterChange}
        onClear={handleFilterClear}
      />

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        onRowClick={(row) => navigate(`/materials/${row.id}`)}
        empty={{
          icon: FileText,
          title: 'No materials found',
          description: 'No materials match the current filters.',
        }}
        totalElements={data?.totalElements}
      />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
    </div>
  )
}
