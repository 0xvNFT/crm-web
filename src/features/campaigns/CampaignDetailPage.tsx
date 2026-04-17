import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Play, CheckCircle, XCircle } from 'lucide-react'
import {
  useCampaign,
  useDeleteCampaign,
  useActivateCampaign,
  useCompleteCampaign,
  useCancelCampaign,
} from '@/api/endpoints/campaigns'
import { useRole } from '@/hooks/useRole'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import { formatDate, formatCurrency, formatLabel } from '@/utils/formatters'
import { DetailSection, DetailField } from '@/components/shared/DetailSection'
import { EntityHistorySection } from '@/components/shared/EntityHistorySection'
import { EntityNotesSection } from '@/components/shared/EntityNotesSection'
import { EntityTagsSection } from '@/components/shared/EntityTagsSection'
import { CampaignContactsSection } from './components/CampaignContactsSection'
import { CampaignProductsSection } from './components/CampaignProductsSection'

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useRole()

  const { data: campaign, isLoading, isError } = useCampaign(id ?? '')
  const { mutate: deleteCampaign, isPending: isDeleting }   = useDeleteCampaign()
  const { mutate: activateCampaign, isPending: isActivating } = useActivateCampaign(id ?? '')
  const { mutate: completeCampaign, isPending: isCompleting } = useCompleteCampaign(id ?? '')
  const { mutate: cancelCampaign,   isPending: isCancelling } = useCancelCampaign(id ?? '')

  const [showDelete,   setShowDelete]   = useState(false)
  const [showActivate, setShowActivate] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [showCancel,   setShowCancel]   = useState(false)

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !campaign) return <ErrorMessage message="Campaign not found." />

  const status = campaign.status ?? ''
  const isDraft     = status === 'draft'
  const isActive    = status === 'active'
  const isCompleted = status === 'completed'
  const isCancelled = status === 'cancelled'
  const isTerminal  = isCompleted || isCancelled

  const canEdit   = isManager && !isTerminal
  const canDelete = isManager && isDraft
  const canActivate = isManager && isDraft
  const canComplete = isManager && isActive
  const canCancel   = isManager && (isDraft || isActive)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
              {campaign.name}
            </h1>
            <StatusBadge status={status ?? 'unknown'} />
          </div>
          {campaign.type && (
            <p className="mt-1 text-sm text-muted-foreground">{formatLabel(campaign.type)}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {canActivate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActivate(true)}
              disabled={isActivating}
            >
              <Play className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
              Activate
            </Button>
          )}
          {canComplete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComplete(true)}
              disabled={isCompleting}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
              Complete
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancel(true)}
              disabled={isCancelling}
            >
              <XCircle className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
              Cancel
            </Button>
          )}
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/campaigns/${id}/edit`)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDelete(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Campaign info */}
      <DetailSection title="Campaign Details">
        <DetailField label="Name"      value={campaign.name} />
        <DetailField label="Type"      value={campaign.type ? formatLabel(campaign.type) : undefined} />
        <DetailField label="Owner"     value={campaign.ownerName} />
        <DetailField label="Territory" value={campaign.territoryName} />
        <DetailField label="Created By" value={campaign.createdByName} />
      </DetailSection>

      <DetailSection title="Timeline & Budget">
        <DetailField label="Start Date" value={campaign.startDate ? formatDate(campaign.startDate) : undefined} />
        <DetailField label="End Date"   value={campaign.endDate ? formatDate(campaign.endDate) : undefined} />
        <DetailField
          label="Budget"
          value={campaign.budget != null ? formatCurrency(campaign.budget as number) : undefined}
        />
        <DetailField label="Total Contacts"   value={campaign.totalContacts?.toString()} />
        <DetailField label="Reached Contacts" value={campaign.reachedContacts?.toString()} />
      </DetailSection>

      {campaign.description && (
        <DetailSection title="Description" noGrid>
          <p className="text-sm text-foreground whitespace-pre-wrap">{campaign.description}</p>
        </DetailSection>
      )}

      {/* Sub-sections */}
      <CampaignContactsSection campaignId={id ?? ''} isActive={isActive} />
      <CampaignProductsSection campaignId={id ?? ''} isTerminal={isTerminal} />

      {/* Shared sections */}
      <EntityNotesSection entityType="PharmaCampaign" entityId={id ?? ''} />
      <EntityTagsSection  entityType="PharmaCampaign" entityId={id ?? ''} />
      <EntityHistorySection entityType="PharmaCampaign" entityId={id ?? ''} />

      {/* Dialogs */}
      <ConfirmDialog
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={() =>
          deleteCampaign(id!, {
            onSuccess: () => {
              toast('Campaign deleted', { variant: 'success' })
              navigate('/campaigns')
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Delete Campaign?"
        description="This will permanently delete this campaign and all associated contacts and products."
        confirmLabel="Delete"
        isPending={isDeleting}
      />

      <ConfirmDialog
        open={showActivate}
        onCancel={() => setShowActivate(false)}
        onConfirm={() =>
          activateCampaign(undefined, {
            onSuccess: () => { toast('Campaign activated', { variant: 'success' }); setShowActivate(false) },
            onError: (err) => { toast(parseApiError(err), { variant: 'destructive' }); setShowActivate(false) },
          })
        }
        title="Activate Campaign?"
        description="Activating this campaign will enable visit and activity tracking against it."
        confirmLabel="Activate"
        isPending={isActivating}
      />

      <ConfirmDialog
        open={showComplete}
        onCancel={() => setShowComplete(false)}
        onConfirm={() =>
          completeCampaign(undefined, {
            onSuccess: () => { toast('Campaign completed', { variant: 'success' }); setShowComplete(false) },
            onError: (err) => { toast(parseApiError(err), { variant: 'destructive' }); setShowComplete(false) },
          })
        }
        title="Complete Campaign?"
        description="Mark this campaign as completed. It will no longer accept new visits or activities."
        confirmLabel="Complete"
        isPending={isCompleting}
      />

      <ConfirmDialog
        open={showCancel}
        onCancel={() => setShowCancel(false)}
        onConfirm={() =>
          cancelCampaign(undefined, {
            onSuccess: () => { toast('Campaign cancelled', { variant: 'success' }); setShowCancel(false) },
            onError: (err) => { toast(parseApiError(err), { variant: 'destructive' }); setShowCancel(false) },
          })
        }
        title="Cancel Campaign?"
        description="This will cancel the campaign. This action cannot be undone."
        confirmLabel="Cancel Campaign"
        isPending={isCancelling}
      />
    </div>
  )
}
