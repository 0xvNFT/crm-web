import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart } from 'lucide-react';
import { useOrders, useOrderSearch } from '@/api/endpoints/orders';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterBar, type FilterDef } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { PharmaOrder } from '@/api/app-types';

const ORDER_FILTERS: FilterDef[] = [
  { param: 'status', label: 'Status', configKey: 'order.status' },
  { param: 'accountId', label: 'Account', configKey: 'account.name' },
];

const columns: Column<PharmaOrder>[] = [
  {
    header: 'Order #',
    accessor: (row) => (
      <div>
        <p className="font-medium text-foreground">{row.orderNumber}</p>
      </div>
    ),
  },
  { header: 'Account', accessor: (row) => row.account?.name ?? '—' },
  { 
    header: 'Status', 
    accessor: (row) => <StatusBadge status={row.status?.toUpperCase() ?? 'UNKNOWN'} /> 
  },
  { 
    header: 'Total', 
    accessor: (row) => formatCurrency(row.totalAmount) 
  },
  { header: 'Owner', accessor: (row) => row.owner?.fullName ?? '—' },
  { 
    header: 'Created', 
    accessor: (row) => formatDate(row.createdAt) 
  },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  const { page, goToPage } = usePagination();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const isSearching = debouncedQuery.trim().length >= 2;

  const listQuery = useOrders(page, 20, filters);
  const searchQuery = useOrderSearch(debouncedQuery);

  function handleFilterChange(param: string, value: string) {
    setFilters((prev) => ({ ...prev, [param]: value }));
    goToPage(0);
  }

  function handleFilterClear() {
    setFilters({});
    goToPage(0);
  }

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading;
  const isError = isSearching ? searchQuery.isError : listQuery.isError;
  const data: PharmaOrder[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? []);
  const totalPages = isSearching ? 0 : (listQuery.data?.totalPages ?? 0);

  if (isLoading && !isSearching) return <LoadingSpinner />;
  if (isError) return <ErrorMessage />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders"
        description="Manage and track pharmaceutical orders"
        actions={
          <Button size="sm" onClick={() => navigate('/orders/new')}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Order
          </Button>
        }
      />
      <SearchInput
        value={query}
        onChange={(v) => { setQuery(v); goToPage(0); }}
        placeholder="Search by order number…"
        className="max-w-sm"
      />
      {!isSearching && (
        <FilterBar
          filters={ORDER_FILTERS}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleFilterClear}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/orders/${row.id}`)}
        empty={isSearching
          ? { icon: ShoppingCart, title: `No orders found for "${debouncedQuery}"`, description: 'Try a different search term.' }
          : { icon: ShoppingCart, title: 'No orders yet', description: 'Create your first order to get started.' }
        }
        totalElements={isSearching ? data.length : listQuery.data?.totalElements}
      />
      {!isSearching && <Pagination page={page} totalPages={totalPages} onChange={goToPage} />}
    </div>
  );
}