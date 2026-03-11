import { useParams } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import { useLead } from '@/api/endpoints/leads'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { formatDate } from '@/utils/formatters'

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">{title}</h3>
      <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2">
        {children}
      </div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="text-sm">{value || '—'}</div>
    </div>
  )
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const { data: lead, isLoading, isError } = useLead(id ?? '')

  if (isLoading) return <LoadingSpinner />
  if (isError || !lead) return <ErrorMessage message="Lead not found." />

  const leadName = `${lead.firstName ?? ''} ${lead.lastName}`.trim()

  return (
    <div className="space-y-6">
      <PageHeader
        title={leadName}
        description={lead.companyName}
      />

      <div className="flex flex-wrap gap-6">
        {lead.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            {lead.email}
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            {lead.phone}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <DetailSection title="Lead Info">
            <DetailField label="Lead Name" value={leadName} />
            <DetailField label="Company" value={lead.companyName} />
            <DetailField label="Status" value={<StatusBadge status={lead.leadStatus ?? 'UNKNOWN'} />} />
            <DetailField label="Rating" value={lead.rating} />
            <DetailField label="Source" value={lead.leadSource} />
            <DetailField label="Score" value={lead.leadScore} />
          </DetailSection>

          <DetailSection title="Contact Info">
            <DetailField label="Email" value={lead.email} />
            <DetailField label="Phone" value={lead.phone} />
            <DetailField label="Mobile" value="—" />
            <DetailField label="Website" value="—" />
          </DetailSection>
        </div>

        <div className="space-y-6">
          <DetailSection title="Assignment">
            <DetailField label="Owner" value={lead.assignedUser?.fullName} />
          </DetailSection>

          <DetailSection title="Qualification">
            <DetailField label="Converted" value={lead.isConverted ? 'Yes' : 'No'} />
            <DetailField label="Converted Date" value={formatDate(lead.convertedDate)} />
          </DetailSection>

          <DetailSection title="Timestamps">
            <DetailField label="Created At" value={formatDate(lead.createdAt)} />
            <DetailField label="Updated At" value={formatDate(lead.updatedAt)} />
          </DetailSection>
        </div>
      </div>
    </div>
  )
}