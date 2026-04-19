import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCheckOutVisit } from '@/api/endpoints/visits'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TextareaWithCounter } from '@/components/ui/textarea-with-counter'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'
import { checkOutSchema, type CheckOutFormData } from '@/schemas/visits'

interface VisitCheckOutDialogProps {
  open: boolean
  visitId: string
  onClose: () => void
}

export function VisitCheckOutDialog({ open, visitId, onClose }: VisitCheckOutDialogProps) {
  const { mutate: checkOut, isPending } = useCheckOutVisit()
  const outcomeOptions = useConfigOptions('visit.outcome')

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm<CheckOutFormData>({
    resolver: zodResolver(checkOutSchema),
  })

  if (!open) return null

  function onSubmit(data: CheckOutFormData) {
    checkOut(
      { id: visitId, ...data },
      {
        onSuccess: () => {
          toast('Checked out successfully', { variant: 'success' })
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
          <h2 className="text-lg font-semibold">Check Out</h2>
          <p className="text-sm text-muted-foreground">Record the outcome of your visit.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Outcome <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="outcome"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  disabled={outcomeOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={outcomeOptions.length === 0 ? 'Loading…' : 'Select outcome…'} />
                  </SelectTrigger>
                  <SelectContent>
                    {outcomeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.outcome && (
              <p className="text-xs text-destructive">{errors.outcome.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Key Discussion Points</Label>
            <TextareaWithCounter
              {...register('keyDiscussionPoints')}
              placeholder="What was discussed?"
              rows={2}
              maxLength={2000}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Customer Feedback</Label>
            <TextareaWithCounter
              {...register('customerFeedback')}
              placeholder="Any feedback from the customer?"
              rows={2}
              maxLength={2000}
            />
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
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Checking out…' : 'Check Out'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
