import { useNavigate } from 'react-router-dom'
import { Plus, Megaphone } from 'lucide-react'
import { useCampaigns, useCampaignSearch } from '@/api/endpoints/campaigns'
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
import type { PharmaCampaign } from '@/api/app-types'

const CAMPAIGN_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'campaign.status' },
  { param: 'type',   label: 'Type',   configKey: 'campaign.type' },
]

const FILTER_KEYS = ['status', 'type']

const columns: Column<PharmaCampaign>[] = [
  {
    header: 'Campaign',
    accessor: 'name',
    sortable: true,
    cell: (row) => (
      <div>
        <span className="font-medium text-foreground">{row.name ?? '—'}</span>
        {row.type && (
          <p className="text-xs text-muted-foreground mt-0.5">{formatLabel(row.type)}</p>
        )}
      </div>
    ),
  },
  {
    header: 'Status',
    accessor: (row) => <StatusBadge status={row.status ?? 'unknown'} />,
  },
  {
    header: 'Owner',
    accessor: (row) => (
      <span className="text-muted-foreground">{row.ownerName ?? '—'}</span>
    ),
  },
  {
    header: 'Dates',
    accessor: (row) => (
      <span className="text-muted-foreground tabular-nums text-xs">
        {row.startDate ? formatDate(row.startDate) : '—'}
        {row.endDate ? ` → ${formatDate(row.endDate)}` : ''}
      </span>
    ),
  },
  {
    header: 'Contacts',
    accessor: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {row.totalContacts != null ? row.totalContacts : '—'}
      </span>
    ),
  },
]

export default function CampaignListPage() {
  const navigate = useNavigate()
  const { isManager } = useRole()
  const { page, filters, goToPage, setFilter, clearFilters } = useListParams(FILTER_KEYS)

  const listQuery = useCampaigns(page, 20, filters)
  const { query, debouncedQuery, setQuery, isSearching, resolve } =
    useListSearch<PharmaCampaign>(goToPage)
  const searchQuery = useCampaignSearch(debouncedQuery)

  const { isLoading, isError, error, data, totalPages, totalElements } = resolve(
    listQuery,
    searchQuery,
  )

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage error={error} onRetry={() => listQuery.refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Campaigns"
        description="Manage promotional campaigns, track HCP engagement and product focus."
        actions={
          isManager ? (
            <Button
              size="sm"
              onClick={() => navigate('/campaigns/new')}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              New Campaign
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-muted/20 px-4 py-3">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search campaigns…"
            className="w-60 shrink-0"
          />
          {!isSearching && (
            <FilterBar
              filters={CAMPAIGN_FILTERS}
              values={filters}
              onChange={(param, value) => setFilter(param, value)}
              onClear={clearFilters}
            />
          )}
          {totalElements !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {totalElements.toLocaleString()}{' '}
              {totalElements === 1 ? 'campaign' : 'campaigns'}
            </span>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data}
          onRowClick={(row) => navigate(`/campaigns/${row.id}`)}
          empty={
            isSearching
              ? {
                  icon: Megaphone,
                  title: `No campaigns match "${query}"`,
                  description: 'Try a different search term.',
                }
              : {
                  icon: Megaphone,
                  title: 'No campaigns yet',
                  description: 'Create your first campaign to start tracking HCP engagement.',
                }
          }
        />

        {!isSearching && totalPages > 1 && (
          <div className="border-t border-border/40 px-4">
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </div>
        )}
      </div>
    </div>
  )
}
