import { useOpportunitiesByAccount } from '@/api/endpoints/opportunities'
import { usePagination } from '@/hooks/usePagination'
import { OpportunitiesSection } from '@/components/shared/OpportunitiesSection'

interface AccountOpportunitiesSectionProps {
  accountId: string
}

export function AccountOpportunitiesSection({ accountId }: AccountOpportunitiesSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useOpportunitiesByAccount(accountId, page)

  return (
    <OpportunitiesSection
      opportunities={data?.content ?? []}
      totalPages={data?.totalPages ?? 0}
      page={page}
      onPageChange={goToPage}
      isLoading={isLoading}
      emptyDescription="Opportunities linked to this account will appear here."
    />
  )
}
