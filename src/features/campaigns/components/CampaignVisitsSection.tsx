import { useVisitsByCampaign } from '@/api/endpoints/visits'
import { usePagination } from '@/hooks/usePagination'
import { VisitsSection } from '@/components/shared/VisitsSection'

interface CampaignVisitsSectionProps {
  campaignId: string
}

export function CampaignVisitsSection({ campaignId }: CampaignVisitsSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useVisitsByCampaign(campaignId, page, 10)

  return (
    <VisitsSection
      visits={data?.content ?? []}
      totalPages={data?.totalPages ?? 0}
      page={page}
      onPageChange={goToPage}
      isLoading={isLoading}
      emptyDescription="No visits have been linked to this campaign yet."
    />
  )
}
