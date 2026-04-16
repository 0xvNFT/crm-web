import { useVisitsByOpportunity } from '@/api/endpoints/visits'
import { usePagination } from '@/hooks/usePagination'
import { VisitsSection } from '@/components/shared/VisitsSection'

interface OpportunityVisitsSectionProps {
  opportunityId: string
}

export function OpportunityVisitsSection({ opportunityId }: OpportunityVisitsSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useVisitsByOpportunity(opportunityId, page)

  return (
    <VisitsSection
      visits={data?.content ?? []}
      totalPages={data?.totalPages ?? 0}
      page={page}
      onPageChange={goToPage}
      isLoading={isLoading}
      emptyDescription="Visits linked to this opportunity will appear here."
    />
  )
}
