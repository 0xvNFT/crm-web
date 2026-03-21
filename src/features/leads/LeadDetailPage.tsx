import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Pencil } from 'lucide-react'
import { useLead, useConvertLead } from '@/api/endpoints/leads'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { useRole } from '@/hooks/useRole'
import { formatDate, formatLabel } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : String(value)

  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  )
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useRole()
  const { data: lead, isLoading, isError } = useLead(id ?? '')
  const { mutate: convertLead, isPending: isConverting } = useConvertLead()
  const [showConvert, setShowConvert] = useState(false)

  if (isLoading) return <LoadingSpinner />
  if (isError || !lead) return <ErrorMessage message="Lead not found." />

  const leadName = `${lead.firstName ?? ''} ${lead.lastName}`.trim()
  const canConvert = isManager && !lead.isConverted

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{leadName}</h1>
            {lead.leadStatus && <StatusBadge status={lead.leadStatus} />}
          </div>
          {lead.companyName && (
            <p className="mt-1 text-sm text-muted-foreground">{lead.companyName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
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
        <DetailField label="Owner" value={lead.assignedUser?.fullName} />
      </DetailSection>

      <DetailSection title="Qualification">
        <DetailField label="Converted" value={lead.isConverted} />
        <DetailField label="Converted Date" value={lead.convertedDate ? formatDate(lead.convertedDate) : null} />
      </DetailSection>

      <DetailSection title="Timestamps">
        <DetailField label="Created" value={lead.createdAt ? formatDate(lead.createdAt) : null} />
        <DetailField label="Last Updated" value={lead.updatedAt ? formatDate(lead.updatedAt) : null} />
      </DetailSection>

      <ConfirmDialog
        open={showConvert}
        onCancel={() => setShowConvert(false)}
        onConfirm={() =>
          convertLead(
            { id: id ?? '', data: {} },
            {
              onSuccess: () => {
                toast('Lead converted successfully', { variant: 'success' })
                setShowConvert(false)
              },
              onError: (err) => {
                toast(parseApiError(err), { variant: 'destructive' })
                setShowConvert(false)
              },
            }
          )
        }
        title="Convert Lead?"
        description="This will convert the lead into an account and opportunity. This action cannot be undone."
        confirmLabel="Convert"
        isPending={isConverting}
      />
    </div>
  )
}
