import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRejectVisit } from '@/api/endpoints/visits'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { rejectVisitSchema, type RejectVisitFormData } from '@/schemas/visits'

interface VisitRejectDialogProps {
  open: boolean
  visitId: string
  onClose: () => void
}

export function VisitRejectDialog({ open, visitId, onClose }: VisitRejectDialogProps) {
  const { mutate: rejectVisit, isPending } = useRejectVisit()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RejectVisitFormData>({
    resolver: zodResolver(rejectVisitSchema),
  })

  if (!open) return null

  function onSubmit(data: RejectVisitFormData) {
    rejectVisit(
      { id: visitId, reason: data.reason },
      {
        onSuccess: () => {
          toast('Visit rejected', { variant: 'success' })
          reset()
          onClose()
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-xl border shadow-lg w-full max-w-md p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Reject Visit?</h2>
          <p className="text-sm text-muted-foreground">
            Provide a reason so the rep can make corrections and resubmit.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              {...register('reason')}
              placeholder="Explain what needs to be corrected…"
              rows={3}
              autoFocus
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onClose() }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Rejecting…' : 'Reject Visit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
