import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useContacts, useContactSearch } from '@/api/endpoints/contacts'
import { useListParams } from '@/hooks/useListParams'
import { useListSearch } from '@/hooks/useListSearch'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { formatLabel } from '@/utils/formatters'
import type { PharmaContact } from '@/api/app-types'

const CONTACT_FILTERS: FilterDef[] = [
  { param: 'contactType', label: 'Type', configKey: 'contact.type' },
  { param: 'status', label: 'Status', configKey: 'contact.status' },
]

const columns: Column<PharmaContact>[] = [
  {
    header: 'Name',
    accessor: (row) => (
      <div>
        <p className="font-medium text-foreground">
          {[row.salutation, row.firstName, row.lastName].filter(Boolean).join(' ')}
        </p>
        {row.title && <p className="text-xs text-muted-foreground">{row.title}</p>}
      </div>
    ),
  },
  { header: 'Type', accessor: 'contactType', sortable: true, cell: (row) => formatLabel(row.contactType) },
  { header: 'Specialty', accessor: 'specialty', sortable: true, cell: (row) => row.specialty ?? '—' },
  { header: 'Account', accessor: (row) => row.accountName ?? '—' },
  { header: 'Mobile', accessor: (row) => <span className="text-muted-foreground tabular-nums">{row.mobile ?? row.phone ?? '—'}</span> },
  { header: 'Status', accessor: (row) => <StatusBadge status={row.status ?? 'active'} /> },
]

const FILTER_KEYS = ['contactType', 'status']

export default function ContactListPage() {
  const navigate = useNavigate()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery   = useContacts(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } = useListSearch<PharmaContact>(goToPage)
  const searchQuery = useContactSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(listQuery, searchQuery)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Contacts"
        description="Doctors, pharmacists, and healthcare professionals"
        actions={
          <Button size="sm" onClick={() => navigate('/contacts/new')} className="h-8 gap-1.5 text-xs font-medium">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            New Contact
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
            placeholder="Search by name…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={CONTACT_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()} {totalElements === 1 ? 'contact' : 'contacts'}
            </span>
          )}
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/contacts/${row.id}`)}
          empty={isSearching
            ? { icon: Users, title: `No contacts match "${query}"`, description: 'Try a different search term.' }
            : { icon: Users, title: 'No contacts yet', description: 'Add your first contact to get started.' }
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
