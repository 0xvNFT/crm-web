import { useOpportunitiesByContact } from '@/api/endpoints/opportunities'
import { usePagination } from '@/hooks/usePagination'
import { OpportunitiesSection } from '@/components/shared/OpportunitiesSection'

interface ContactOpportunitiesSectionProps {
  contactId: string
}

export function ContactOpportunitiesSection({ contactId }: ContactOpportunitiesSectionProps) {
  const { page, goToPage } = usePagination()
  const { data, isLoading } = useOpportunitiesByContact(contactId, page)

  return (
    <OpportunitiesSection
      opportunities={data?.content ?? []}
      totalPages={data?.totalPages ?? 0}
      page={page}
      onPageChange={goToPage}
      isLoading={isLoading}
      emptyDescription="Opportunities linked to this contact will appear here."
    />
  )
}
