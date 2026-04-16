import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Pencil, User } from 'lucide-react'
import { useLead, useUpdateLead } from '@/api/endpoints/leads'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EntityHistorySection } from '@/components/shared/EntityHistorySection'
import { EntityNotesSection } from '@/components/shared/EntityNotesSection'
import { EntityTagsSection } from '@/components/shared/EntityTagsSection'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { useRole } from '@/hooks/useRole'
import { formatDate, formatLabel } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { LeadConvertDialog } from './components/LeadConvertDialog'
import { DetailSection, DetailField } from '@/components/shared/DetailSection'

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()
  const { data: lead, isLoading, isError } = useLead(id ?? '')
  const { mutate: updateLead, isPending: isClosing } = useUpdateLead(id ?? '')
  const [showConvert, setShowConvert] = useState(false)
  const [showClose, setShowClose] = useState(false)

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !lead) return <ErrorMessage message="Lead not found." />

  const leadName = `${lead.firstName ?? ''} ${lead.lastName}`.trim()
  const canConvert = isManager && !lead.isConverted && !isReadOnly
  const canClose = isManager && lead.leadStatus !== 'canceled' && !lead.isConverted && !isReadOnly

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{leadName}</h1>
            {lead.leadStatus && <StatusBadge status={lead.leadStatus} />}
          </div>
          {lead.companyName && (
            <p className="mt-1 text-sm text-muted-foreground">{lead.companyName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          {canClose && (
            <Button variant="outline" size="sm" onClick={() => setShowClose(true)}>
              Close Lead
            </Button>
          )}
          {canConvert && (
            <Button onClick={() => setShowConvert(true)}>
              Convert Lead
            </Button>
          )}
        </div>
      </div>

      {(lead.email || lead.phone) && (
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
      )}

      <DetailSection title="Lead Info">
        <DetailField label="Lead Name" value={leadName} />
        <DetailField label="Company" value={lead.companyName} />
        <DetailField label="Status" value={lead.leadStatus ? formatLabel(lead.leadStatus) : null} />
        <DetailField label="Rating" value={lead.rating} />
        <DetailField label="Source" value={lead.leadSource} />
        <DetailField label="Score" value={lead.leadScore} />
      </DetailSection>

      <DetailSection title="Contact Info">
        <DetailField label="Email" value={lead.email} />
        <DetailField label="Phone" value={lead.phone} />
      </DetailSection>

      <DetailSection title="Assignment">
        <DetailField label="Owner" value={lead.assignedUserName ?? null} />
      </DetailSection>

      <DetailSection title="Qualification">
        <DetailField label="Converted" value={lead.isConverted} />
        <DetailField label="Converted Date" value={lead.convertedDate ? formatDate(lead.convertedDate) : null} />
        {lead.relatedContactId && (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-muted-foreground">Related Contact</p>
            <button
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              onClick={() => navigate(`/contacts/${lead.relatedContactId}`)}
            >
              <User className="h-3.5 w-3.5" strokeWidth={1.5} />
              {lead.relatedContactName ?? 'View Contact'}
            </button>
          </div>
        )}
      </DetailSection>

      <DetailSection title="Timestamps">
        <DetailField label="Created" value={lead.createdAt ? formatDate(lead.createdAt) : null} />
        <DetailField label="Last Updated" value={lead.updatedAt ? formatDate(lead.updatedAt) : null} />
      </DetailSection>

      <EntityTagsSection entityType="PharmaLead" entityId={id ?? ''} />
          <EntityNotesSection entityType="PharmaLead" entityId={id ?? ''} />
      <EntityHistorySection entityType="PharmaLead" entityId={id ?? ''} />

      <ConfirmDialog
        open={showClose}
        onCancel={() => setShowClose(false)}
        onConfirm={() =>
          updateLead(
            { leadStatus: 'canceled' },
            {
              onSuccess: () => {
                toast('Lead closed', { variant: 'success' })
                setShowClose(false)
              },
              onError: (err) => {
                toast(parseApiError(err), { variant: 'destructive' })
                setShowClose(false)
              },
            }
          )
        }
        title="Close Lead?"
        description="This will mark the lead as closed. The lead history will be preserved."
        confirmLabel="Close Lead"
        isPending={isClosing}
      />

      <LeadConvertDialog
        open={showConvert}
        leadId={id ?? ''}
        sourceAccountId={lead.relatedAccountId}
        sourceAccountName={lead.relatedAccountName}
        sourceContactId={lead.relatedContactId}
        sourceContactName={lead.relatedContactName}
        onClose={() => setShowConvert(false)}
      />
    </div>
  )
}
