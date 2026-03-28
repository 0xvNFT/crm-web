import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useMaterials } from '@/api/endpoints/materials'
import { usePagination } from '@/hooks/usePagination'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { formatDate } from '@/utils/formatters'
import type { PharmaMaterial } from '@/api/app-types'

const MATERIAL_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'material.status' },
]

export default function MaterialListPage() {
  const navigate = useNavigate()
  const { page, goToPage } = usePagination()
  const [filters, setFilters] = useState<Record<string, string>>({})

  const columns: Column<PharmaMaterial>[] = [
    { header: 'Title', accessor: 'title', sortable: true },
    { header: 'File Name', accessor: (row) => row.fileName ?? '—' },
    { header: 'Category', accessor: (row) => row.category ?? '—' },
    { header: 'Version', accessor: (row) => row.versionNumber ?? '—' },
    { header: 'Publish Date', accessor: (row) => row.publishDate ? formatDate(row.publishDate) : '—' },
    { header: 'Current', accessor: (row) => row.isCurrent ? 'Yes' : 'No' },
    {
      header: 'Status',
      accessor: (row) => row.status ? <StatusBadge status={row.status} /> : '—',
    },
  ]

  const { data, isLoading, isError } = useMaterials(page, 20, filters)

  function handleFilterChange(param: string, value: string) {
    setFilters((prev) => ({ ...prev, [param]: value }))
    goToPage(0)
  }

  function handleFilterClear() {
    setFilters({})
    goToPage(0)
  }

  const rows = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  if (isError) {
    return <p className="text-sm text-destructive">Failed to load materials.</p>
  }

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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={rows}
            onRowClick={(row) => navigate(`/materials/${row.id}`)}
            empty={{
              icon: FileText,
              title: 'No materials found',
              description: 'No materials match the current filters.',
            }}
          />
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={goToPage}
            />
          )}
        </>
      )}
    </div>
  )
}
