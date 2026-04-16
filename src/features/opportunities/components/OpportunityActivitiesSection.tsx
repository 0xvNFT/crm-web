import { useActivitiesByOpportunity } from '@/api/endpoints/activities'
import { usePagination } from '@/hooks/usePagination'
import { ActivitiesSection } from '@/components/shared/ActivitiesSection'

interface OpportunityActivitiesSectionProps {
  opportunityId: string
}

export function OpportunityActivitiesSection({ opportunityId }: OpportunityActivitiesSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useActivitiesByOpportunity(opportunityId, page)

  return (
    <ActivitiesSection
      activities={data?.content ?? []}
      totalPages={data?.totalPages ?? 0}
      page={page}
      onPageChange={goToPage}
      isLoading={isLoading}
      emptyDescription="Activities linked to this opportunity will appear here."
    />
  )
}
