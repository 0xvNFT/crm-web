import { useVisitsByContact } from '@/api/endpoints/visits'
import { usePagination } from '@/hooks/usePagination'
import { VisitsSection } from '@/components/shared/VisitsSection'

interface ContactVisitsSectionProps {
  contactId: string
}

export function ContactVisitsSection({ contactId }: ContactVisitsSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useVisitsByContact(contactId, page)

  return (
    <VisitsSection
      visits={data?.content ?? []}
      totalPages={data?.totalPages ?? 0}
      page={page}
      onPageChange={goToPage}
      isLoading={isLoading}
      emptyDescription="Visits for this contact will appear here."
    />
  )
}
