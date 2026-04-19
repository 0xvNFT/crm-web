import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, User, CheckCircle, XCircle, LogIn, LogOut, Send, FileSignature, Pencil, TrendingUp } from 'lucide-react'
import { useVisit, useSubmitVisit, useApproveVisit, useCheckInVisit } from '@/api/endpoints/visits'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/hooks/useAuth'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EntityHistorySection } from '@/components/shared/EntityHistorySection'
import { EntityNotesSection } from '@/components/shared/EntityNotesSection'
import { EntityTagsSection } from '@/components/shared/EntityTagsSection'
import { Button } from '@/components/ui/button'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { VisitEditForm } from './components/VisitEditForm'
import { VisitRejectDialog } from './components/VisitRejectDialog'
import { VisitCheckOutDialog } from './components/VisitCheckOutDialog'
import { SignatureCaptureDialog } from './components/SignatureCaptureDialog'
import { VisitProductsSection } from './components/VisitProductsSection'
import { VisitMaterialsSection } from './components/VisitMaterialsSection'
import { DetailSection, DetailField } from '@/components/shared/DetailSection'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager, isReadOnly } = useRole()
  const { user } = useAuth()

  const { data: visit, isLoading, isError, error, refetch } = useVisit(id ?? '')

  const { mutate: submitVisit, isPending: isSubmitting } = useSubmitVisit()
  const { mutate: approveVisit, isPending: isApproving } = useApproveVisit()
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckInVisit()

  const [editing, setEditing] = useState(false)
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showCheckOut, setShowCheckOut] = useState(false)
  const [showSignature, setShowSignature] = useState(false)

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !visit) return <ErrorMessage message="Visit not found." error={error} onRetry={() => refetch()} />

  const status = visit.status?.toUpperCase() ?? ''
  const submissionStatus = visit.submissionStatus?.toUpperCase() ?? ''
  const isOwnVisit = visit.assignedRepId === user?.userId
  const isApproved = submissionStatus === 'APPROVED'

  const canCheckIn = isOwnVisit && status === 'SCHEDULED' && !visit.checkInTime && !isReadOnly
  const canCheckOut = isOwnVisit && status === 'IN_PROGRESS' && !visit.checkOutTime && !isReadOnly
  const signatureBlocking = !!visit.signatureRequired && !visit.signatureCaptured
  const canCaptureSignature = isOwnVisit && status === 'COMPLETED' && signatureBlocking && !isReadOnly
  const canSubmit = isOwnVisit && status === 'COMPLETED' && !signatureBlocking && submissionStatus !== 'SUBMITTED' && !isApproved && !isReadOnly
  const canApproveReject = isManager && submissionStatus === 'SUBMITTED' && !isReadOnly
  const canEdit = (isOwnVisit || isManager) && status === 'SCHEDULED' && !isApproved && !isReadOnly

  function handleCheckIn() {
    if (!id) return
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          checkIn(
            { id, latitude: pos.coords.latitude, longitude: pos.coords.longitude },
            {
              onSuccess: () => toast('Checked in successfully', { variant: 'success' }),
              onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
            }
          )
        },
        () => {
          checkIn(
            { id, latitude: 0, longitude: 0 },
            {
              onSuccess: () => toast('Checked in (location unavailable)', { variant: 'default' }),
              onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
            }
          )
        }
      )
    } else {
      checkIn(
        { id, latitude: 0, longitude: 0 },
        {
          onSuccess: () => toast('Checked in', { variant: 'success' }),
          onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
        }
      )
    }
    setShowCheckIn(false)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
              {visit.subject ?? visit.visitNumber ?? 'Visit'}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {visit.visitNumber} · {visit.visitType?.replace(/_/g, ' ') ?? 'Field Visit'}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
          {canEdit && !editing && (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          {canCheckIn && (
            <Button size="sm" onClick={() => setShowCheckIn(true)} disabled={isCheckingIn}>
              <LogIn className="h-4 w-4 mr-1.5" />
              Check In
            </Button>
          )}
          {canCheckOut && (
            <Button size="sm" onClick={() => setShowCheckOut(true)}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Check Out
            </Button>
          )}
          {canCaptureSignature && (
            <Button size="sm" variant="outline" onClick={() => setShowSignature(true)}>
              <FileSignature className="h-4 w-4 mr-1.5" />
              Capture Signature
            </Button>
          )}
          {canSubmit && (
            <Button size="sm" variant="outline" onClick={() => setShowSubmit(true)} disabled={isSubmitting}>
              <Send className="h-4 w-4 mr-1.5" />
              Submit for Review
            </Button>
          )}
          {canApproveReject && (
            <>
              <Button size="sm" onClick={() => setShowApprove(true)} disabled={isApproving}>
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setShowReject(true)}>
                <XCircle className="h-4 w-4 mr-1.5" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Inline edit form */}
      {editing && (
        <VisitEditForm
          visitId={id ?? ''}
          visit={visit}
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* Rejection reason banner */}
      {!editing && visit.rejectionReason && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-0.5">Rejected</p>
          <p className="text-sm text-foreground">{visit.rejectionReason}</p>
        </div>
      )}

      {!editing && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DetailSection noGrid title="Visit Details" icon={MapPin}>
              <div className="grid grid-cols-2 gap-3">
                <DetailField label="Account" value={visit.accountName} />
                <DetailField label="Contact" value={visit.contactName} />
                <DetailField label="Assigned Rep" value={visit.assignedRepName} />
                <DetailField label="Territory" value={visit.territoryName} />
                <DetailField label="Visit Type" value={visit.visitType?.replace(/_/g, ' ')} />
                <DetailField label="Priority" value={visit.priority} />
                {visit.opportunityId && (
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground">Opportunity</p>
                    <button
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                      onClick={() => navigate(`/opportunities/${visit.opportunityId}`)}
                    >
                      <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {visit.opportunityName ?? 'View Opportunity'}
                    </button>
                  </div>
                )}
              </div>
            </DetailSection>

            <DetailSection noGrid title="Schedule" icon={Clock}>
              <div className="grid grid-cols-2 gap-3">
                <DetailField label="Scheduled Start" value={formatDateTime(visit.scheduledStart)} />
                <DetailField label="Scheduled End" value={formatDateTime(visit.scheduledEnd)} />
                <DetailField label="Check-in Time" value={visit.checkInTime ? formatDateTime(visit.checkInTime) : null} />
                <DetailField label="Check-out Time" value={visit.checkOutTime ? formatDateTime(visit.checkOutTime) : null} />
                <DetailField label="Duration" value={visit.durationMinutes ? `${visit.durationMinutes} min` : null} />
                <DetailField label="Next Visit" value={visit.nextVisitDate ? formatDate(visit.nextVisitDate) : null} />
              </div>
            </DetailSection>
          </div>

          <DetailSection noGrid title="Call Details" icon={FileSignature}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Call Objectives</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{visit.callObjectives ?? '—'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Outcome</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{visit.outcome ?? '—'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Key Discussion Points</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{visit.keyDiscussionPoints ?? '—'}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">Customer Feedback</p>
                <p className="text-sm text-foreground whitespace-pre-wrap">{visit.customerFeedback ?? '—'}</p>
              </div>
              <DetailField label="Sentiment" value={visit.sentiment} />
              <DetailField label="Submission Status" value={visit.submissionStatus} />
            </div>
          </DetailSection>

          {(visit.followUpRequired || visit.followUpNotes || visit.nextBestAction) && (
            <DetailSection noGrid title="Follow-up" icon={CheckCircle}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailField label="Follow-up Required" value={visit.followUpRequired ? 'Yes' : 'No'} />
                <DetailField label="Next Best Action" value={visit.nextBestAction} />
                <div className="sm:col-span-2 space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground">Follow-up Notes</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{visit.followUpNotes ?? '—'}</p>
                </div>
              </div>
            </DetailSection>
          )}

          {(visit.gpsLatitude || visit.locationName) && (
            <DetailSection noGrid title="Location" icon={MapPin}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <DetailField label="Location Name" value={visit.locationName} />
                <DetailField label="GPS Latitude" value={visit.gpsLatitude?.toString()} />
                <DetailField label="GPS Longitude" value={visit.gpsLongitude?.toString()} />
                <DetailField label="Location Verified" value={visit.locationVerified ? 'Yes' : 'No'} />
              </div>
            </DetailSection>
          )}

          {visit.signatureRequired && (
            <DetailSection noGrid title="Signature" icon={FileSignature}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <DetailField label="Signature Required" value="Yes" />
                <DetailField label="Signature Captured" value={visit.signatureCaptured ? 'Yes' : 'No'} />
                <DetailField label="Captured By" value={visit.signatureCapturedByName} />
                <DetailField label="Captured At" value={visit.signatureCapturedAt ? formatDateTime(visit.signatureCapturedAt) : null} />
              </div>
              {visit.signatureImageUrl && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Signature Image</p>
                  <img
                    src={visit.signatureImageUrl}
                    alt="Captured signature"
                    className="max-h-24 border rounded-md"
                  />
                </div>
              )}
            </DetailSection>
          )}

          {(visit.reviewedById || visit.reviewedAt) && (
            <DetailSection noGrid title="Review" icon={User}>
              <div className="grid grid-cols-2 gap-3">
                <DetailField label="Reviewed By" value={visit.reviewedByName} />
                <DetailField label="Reviewed At" value={visit.reviewedAt ? formatDateTime(visit.reviewedAt) : null} />
              </div>
            </DetailSection>
          )}

          {visit.notes && (
            <DetailSection noGrid title="Notes" icon={FileSignature}>
              <p className="text-sm text-foreground whitespace-pre-wrap">{visit.notes}</p>
            </DetailSection>
          )}

          <VisitProductsSection visitId={id ?? ''} visit={visit} />
          <VisitMaterialsSection visitId={id ?? ''} visit={visit} />
        </>
      )}

      <EntityTagsSection entityType="PharmaFieldVisit" entityId={id ?? ''} />
          <EntityNotesSection entityType="PharmaFieldVisit" entityId={id ?? ''} />
      <EntityHistorySection entityType="PharmaFieldVisit" entityId={id ?? ''} />

      {/* ─── Dialogs ──────────────────────────────────────────────────────────── */}

      <ConfirmDialog
        open={showCheckIn}
        onCancel={() => setShowCheckIn(false)}
        onConfirm={handleCheckIn}
        title="Check In to Visit?"
        description="Your current GPS location will be recorded. Make sure you are at the account location."
        confirmLabel="Check In"
        isPending={isCheckingIn}
      />

      <ConfirmDialog
        open={showSubmit}
        onCancel={() => setShowSubmit(false)}
        onConfirm={() => {
          if (!id) return
          submitVisit(id, {
            onSuccess: () => {
              toast('Visit submitted for review', { variant: 'success' })
              setShowSubmit(false)
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }}
        title="Submit Visit for Review?"
        description="The visit will be sent to your manager for approval. You will not be able to edit it after submission."
        confirmLabel="Submit"
        isPending={isSubmitting}
      />

      <ConfirmDialog
        open={showApprove}
        onCancel={() => setShowApprove(false)}
        onConfirm={() => {
          if (!id) return
          approveVisit(id, {
            onSuccess: () => {
              toast('Visit approved', { variant: 'success' })
              setShowApprove(false)
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }}
        title="Approve Visit?"
        description="The visit report will be marked as approved."
        confirmLabel="Approve"
        isPending={isApproving}
      />

      <VisitRejectDialog
        open={showReject}
        visitId={id ?? ''}
        onClose={() => setShowReject(false)}
      />

      <VisitCheckOutDialog
        open={showCheckOut}
        visitId={id ?? ''}
        onClose={() => setShowCheckOut(false)}
      />

      <SignatureCaptureDialog
        open={showSignature}
        visitId={id ?? ''}
        onClose={() => setShowSignature(false)}
      />
    </div>
  )
}
