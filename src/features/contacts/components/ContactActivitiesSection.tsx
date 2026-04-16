import { useActivitiesByContact } from '@/api/endpoints/activities'
import { usePagination } from '@/hooks/usePagination'
import { ActivitiesSection } from '@/components/shared/ActivitiesSection'

interface ContactActivitiesSectionProps {
  contactId: string
}

export function ContactActivitiesSection({ contactId }: ContactActivitiesSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useActivitiesByContact(contactId, page)

  return (
    <ActivitiesSection
      activities={data?.content ?? []}
      totalPages={data?.totalPages ?? 0}
      page={page}
      onPageChange={goToPage}
      isLoading={isLoading}
      emptyDescription="Activities logged for this contact will appear here."
    />
  )
}
