import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useContacts, useContactSearch } from '@/api/endpoints/contacts'
import { useListParams } from '@/hooks/useListParams'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar'
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
  { header: 'Mobile', accessor: (row) => row.mobile ?? row.phone ?? '—' },
  {
    header: 'Status',
    accessor: (row) => <StatusBadge status={row.status ?? 'active'} />,
  },
]

const FILTER_KEYS = ['contactType', 'status']

export default function ContactListPage() {
  const navigate = useNavigate()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const isSearching = debouncedQuery.trim().length >= 2

  const listQuery = useContacts(page, 20, filters)
  const searchQuery = useContactSearch(debouncedQuery)

  function handleFilterChange(param: string, value: string) {
    setFilter(param, value)
  }

  function handleFilterClear() {
    clearFilters()
  }

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError = isSearching ? searchQuery.isError : listQuery.isError
  const error = isSearching ? searchQuery.error : listQuery.error
  const data: PharmaContact[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} />

  return (
    <div className="space-y-4">
      <PageHeader
        title="Contacts"
        description="Doctors, pharmacists, and healthcare professionals"
        actions={
          <Button size="sm" onClick={() => navigate('/contacts/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Contact
          </Button>
        }
      />
      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0) }}
        placeholder="Search by name…"
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={CONTACT_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/contacts/${row.id}`)}
        empty={isSearching
          ? { icon: Users, title: `No contacts found for "${debouncedQuery}"`, description: 'Try a different search term.' }
          : { icon: Users, title: 'No contacts yet', description: 'Add your first contact to get started.', 
            // action: <Button size="sm" onClick={() => navigate('/contacts/new')}><Plus className="h-4 w-4 mr-1.5" />New Contact</Button> 
          }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  )
}
