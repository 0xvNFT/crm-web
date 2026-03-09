import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, User, CheckCircle, XCircle, LogIn, LogOut, Send, FileSignature } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useVisit, useSubmitVisit, useApproveVisit, useRejectVisit, useCheckInVisit, useCheckOutVisit } from '@/api/endpoints/visits'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { checkOutSchema, rejectVisitSchema, type CheckOutFormData, type RejectVisitFormData } from '@/schemas/visits'

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailSection({ title, icon: Icon, children }: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
        {title}
      </h2>
      {children}
    </div>
  )
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value ?? '—'}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useRole()
  const { user } = useAuth()

  const { data: visit, isLoading, isError } = useVisit(id ?? '')

  const { mutate: submitVisit, isPending: isSubmitting } = useSubmitVisit()
  const { mutate: approveVisit, isPending: isApproving } = useApproveVisit()
  const { mutate: rejectVisit, isPending: isRejecting } = useRejectVisit()
  const { mutate: checkIn, isPending: isCheckingIn } = useCheckInVisit()
  const { mutate: checkOut, isPending: isCheckingOut } = useCheckOutVisit()

  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showCheckOut, setShowCheckOut] = useState(false)

  // Check-out form
  const checkOutForm = useForm<CheckOutFormData>({
    resolver: zodResolver(checkOutSchema),
  })

  // Reject form
  const rejectForm = useForm<RejectVisitFormData>({
    resolver: zodResolver(rejectVisitSchema),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError || !visit) return <ErrorMessage />

  const status = visit.status?.toUpperCase() ?? ''
  const isOwnVisit = (visit.assignedRep as { id?: string } | undefined)?.id === user?.userId

  // Status-driven action availability
  const canCheckIn = isOwnVisit && status === 'SCHEDULED' && !visit.checkInTime
  const canCheckOut = isOwnVisit && !!visit.checkInTime && !visit.checkOutTime
  const canSubmit = isOwnVisit && (status === 'COMPLETED' || status === 'DRAFT') && !['PENDING_APPROVAL', 'APPROVED'].includes(status)
  const canApproveReject = isManager && status === 'PENDING_APPROVAL'

  const assignedRep = visit.assignedRep as { fullName?: string } | undefined
  const reviewedBy = visit.reviewedBy as { fullName?: string } | undefined

  function handleCheckIn() {
    if (!id) return
    // Use browser geolocation if available, else default to 0,0 with note
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
          // Permission denied or unavailable — check in with 0,0
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

  function onCheckOut(data: CheckOutFormData) {
    if (!id) return
    checkOut(
      { id, ...data },
      {
        onSuccess: () => {
          toast('Checked out successfully', { variant: 'success' })
          setShowCheckOut(false)
          checkOutForm.reset()
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      }
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/visits')} className="-ml-2 mt-0.5">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
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
          {canCheckIn && (
            <Button size="sm" onClick={() => setShowCheckIn(true)} disabled={isCheckingIn}>
              <LogIn className="h-4 w-4 mr-1.5" />
              Check In
            </Button>
          )}
          {canCheckOut && (
            <Button size="sm" onClick={() => setShowCheckOut(true)} disabled={isCheckingOut}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Check Out
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
              <Button size="sm" variant="destructive" onClick={() => setShowReject(true)} disabled={isRejecting}>
                <XCircle className="h-4 w-4 mr-1.5" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Rejection reason banner */}
      {visit.rejectionReason && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-0.5">Rejected</p>
          <p className="text-sm text-foreground">{visit.rejectionReason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Visit Info */}
        <DetailSection title="Visit Details" icon={MapPin}>
          <div className="grid grid-cols-2 gap-3">
            <DetailField label="Account" value={visit.account?.name} />
            <DetailField
              label="Contact"
              value={
                visit.contact
                  ? [visit.contact.firstName, visit.contact.lastName].filter(Boolean).join(' ')
                  : null
              }
            />
            <DetailField label="Assigned Rep" value={assignedRep?.fullName} />
            <DetailField label="Territory" value={visit.territory?.name} />
            <DetailField label="Visit Type" value={visit.visitType?.replace(/_/g, ' ')} />
            <DetailField label="Priority" value={visit.priority} />
          </div>
        </DetailSection>

        {/* Schedule */}
        <DetailSection title="Schedule" icon={Clock}>
          <div className="grid grid-cols-2 gap-3">
            <DetailField label="Scheduled Start" value={formatDateTime(visit.scheduledStart)} />
            <DetailField label="Scheduled End" value={formatDateTime(visit.scheduledEnd)} />
            <DetailField label="Check-in Time" value={visit.checkInTime ? formatDateTime(visit.checkInTime) : null} />
            <DetailField label="Check-out Time" value={visit.checkOutTime ? formatDateTime(visit.checkOutTime) : null} />
            <DetailField
              label="Duration"
              value={visit.durationMinutes ? `${visit.durationMinutes} min` : null}
            />
            <DetailField label="Next Visit" value={visit.nextVisitDate ? formatDate(visit.nextVisitDate) : null} />
          </div>
        </DetailSection>
      </div>

      {/* Objectives & Outcome */}
      <DetailSection title="Call Details" icon={FileSignature}>
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

      {/* Follow-up */}
      {(visit.followUpRequired || visit.followUpNotes || visit.nextBestAction) && (
        <DetailSection title="Follow-up" icon={CheckCircle}>
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

      {/* Location */}
      {(visit.gpsLatitude || visit.locationName) && (
        <DetailSection title="Location" icon={MapPin}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <DetailField label="Location Name" value={visit.locationName} />
            <DetailField label="GPS Latitude" value={visit.gpsLatitude?.toString()} />
            <DetailField label="GPS Longitude" value={visit.gpsLongitude?.toString()} />
            <DetailField label="Location Verified" value={visit.locationVerified ? 'Yes' : 'No'} />
          </div>
        </DetailSection>
      )}

      {/* Signature */}
      {visit.signatureRequired && (
        <DetailSection title="Signature" icon={FileSignature}>
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

      {/* Review */}
      {(visit.reviewedBy || visit.reviewedAt) && (
        <DetailSection title="Review" icon={User}>
          <div className="grid grid-cols-2 gap-3">
            <DetailField label="Reviewed By" value={reviewedBy?.fullName} />
            <DetailField label="Reviewed At" value={visit.reviewedAt ? formatDateTime(visit.reviewedAt) : null} />
          </div>
        </DetailSection>
      )}

      {/* Notes */}
      {visit.notes && (
        <DetailSection title="Notes" icon={FileSignature}>
          <p className="text-sm text-foreground whitespace-pre-wrap">{visit.notes}</p>
        </DetailSection>
      )}

      {/* ─── Dialogs ──────────────────────────────────────────────────────────── */}

      {/* Check In */}
      <ConfirmDialog
        open={showCheckIn}
        onCancel={() => setShowCheckIn(false)}
        onConfirm={handleCheckIn}
        title="Check In to Visit?"
        description="Your current GPS location will be recorded. Make sure you are at the account location."
        confirmLabel="Check In"
        isPending={isCheckingIn}
      />

      {/* Submit */}
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

      {/* Approve */}
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

      {/* Reject — inline form for reason */}
      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Reject Visit?</h2>
              <p className="text-sm text-muted-foreground">
                Provide a reason so the rep can make corrections and resubmit.
              </p>
            </div>
            <form
              onSubmit={rejectForm.handleSubmit((data) => {
                if (!id) return
                rejectVisit(
                  { id, reason: data.reason },
                  {
                    onSuccess: () => {
                      toast('Visit rejected', { variant: 'success' })
                      setShowReject(false)
                      rejectForm.reset()
                    },
                    onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
                  }
                )
              })}
              className="space-y-4"
            >
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  Rejection Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  {...rejectForm.register('reason')}
                  placeholder="Explain what needs to be corrected…"
                  rows={3}
                  autoFocus
                />
                {rejectForm.formState.errors.reason && (
                  <p className="text-xs text-destructive">{rejectForm.formState.errors.reason.message}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowReject(false); rejectForm.reset() }}
                  disabled={isRejecting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={isRejecting}>
                  {isRejecting ? 'Rejecting…' : 'Reject Visit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Check Out — inline form for outcome */}
      {showCheckOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Check Out</h2>
              <p className="text-sm text-muted-foreground">Record the outcome of your visit.</p>
            </div>
            <form onSubmit={checkOutForm.handleSubmit(onCheckOut)} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  Outcome <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...checkOutForm.register('outcome')}
                  placeholder="e.g. Productive — script discussed, samples left"
                  autoFocus
                />
                {checkOutForm.formState.errors.outcome && (
                  <p className="text-xs text-destructive">{checkOutForm.formState.errors.outcome.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Key Discussion Points</Label>
                <Textarea
                  {...checkOutForm.register('keyDiscussionPoints')}
                  placeholder="What was discussed?"
                  rows={2}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">Customer Feedback</Label>
                <Textarea
                  {...checkOutForm.register('customerFeedback')}
                  placeholder="Any feedback from the customer?"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowCheckOut(false); checkOutForm.reset() }}
                  disabled={isCheckingOut}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCheckingOut}>
                  {isCheckingOut ? 'Checking out…' : 'Check Out'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
