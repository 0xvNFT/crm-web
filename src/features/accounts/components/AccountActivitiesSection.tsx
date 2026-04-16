import { useActivitiesByAccount } from '@/api/endpoints/activities'
import { usePagination } from '@/hooks/usePagination'
import { ActivitiesSection } from '@/components/shared/ActivitiesSection'

interface AccountActivitiesSectionProps {
  accountId: string
}

export function AccountActivitiesSection({ accountId }: AccountActivitiesSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useActivitiesByAccount(accountId, page)

  return (
    <ActivitiesSection
      activities={data?.content ?? []}
      totalPages={data?.totalPages ?? 0}
      page={page}
      onPageChange={goToPage}
      isLoading={isLoading}
      emptyDescription="Activities linked to this account will appear here."
    />
  )
}
