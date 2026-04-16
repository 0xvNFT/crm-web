import { useVisitsByAccount } from '@/api/endpoints/visits'
import { usePagination } from '@/hooks/usePagination'
import { VisitsSection } from '@/components/shared/VisitsSection'

interface AccountVisitsSectionProps {
  accountId: string
}

export function AccountVisitsSection({ accountId }: AccountVisitsSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useVisitsByAccount(accountId, page)

  return (
    <VisitsSection
      visits={data?.content ?? []}
      totalPages={data?.totalPages ?? 0}
      page={page}
      onPageChange={goToPage}
      isLoading={isLoading}
      emptyDescription="Visits at this account will appear here."
    />
  )
}
