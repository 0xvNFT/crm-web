import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreatePipelineStage, useUpdatePipelineStage } from '@/api/endpoints/pipelineStages'
import { pipelineStageSchema, type PipelineStageFormData } from '@/schemas/pipeline'
import { FormRow } from '@/components/shared/FormRow'
import { CheckboxField } from '@/components/shared/CheckboxField'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PipelineStage } from '@/api/app-types'

interface Props {
  mode:    'create' | 'edit'
  stage?:  PipelineStage
  onClose: () => void
}

export function PipelineStageDialog({ mode, stage, onClose }: Props) {
  const { mutate: create, isPending: isCreating } = useCreatePipelineStage()
  const { mutate: update, isPending: isUpdating } = useUpdatePipelineStage(stage?.id ?? '')
  const isPending = isCreating || isUpdating

  const { register, handleSubmit, formState: { errors } } = useForm<PipelineStageFormData>({
    resolver: zodResolver(pipelineStageSchema),
    defaultValues: {
      name:         stage?.name        ?? '',
      displayOrder: stage?.displayOrder ?? 0,
      probability:  stage?.probability  ?? 0,
      isWon:        stage?.won         ?? false,
      isLost:       stage?.lost        ?? false,
      isDefault:    stage?.defaultStage     ?? false,
      isActive:     stage?.active      ?? true,
    },
  })

  function onSubmit(data: PipelineStageFormData) {
    if (mode === 'create') {
      create(
        { name: data.name, displayOrder: data.displayOrder, probability: data.probability,
          won: data.isWon, lost: data.isLost, defaultStage: data.isDefault },
        {
          onSuccess: () => { toast('Stage created', { variant: 'success' }); onClose() },
          onError:   (err) => toast(parseApiError(err), { variant: 'destructive' }),
        }
      )
    } else {
      update(
        { name: data.name, displayOrder: data.displayOrder, probability: data.probability,
          won: data.isWon, lost: data.isLost, defaultStage: data.isDefault, active: data.isActive },
        {
          onSuccess: () => { toast('Stage updated', { variant: 'success' }); onClose() },
          onError:   (err) => toast(parseApiError(err), { variant: 'destructive' }),
        }
      )
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Pipeline Stage' : 'Edit Pipeline Stage'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <FormRow label="Stage Name" fieldId="name" required error={errors.name?.message}>
            <Input id="name" {...register('name')} placeholder="e.g. Qualification" autoFocus />
          </FormRow>

          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Display Order" fieldId="displayOrder" error={errors.displayOrder?.message}>
              <Input id="displayOrder" type="number" min={0} max={999} {...register('displayOrder')} />
            </FormRow>
            <FormRow label="Win Probability (%)" fieldId="probability" error={errors.probability?.message}>
              <Input id="probability" type="number" min={0} max={100} {...register('probability')} />
            </FormRow>
          </div>

          <div className="space-y-2">
            <CheckboxField id="isWon"     label="Counts as Closed-Won"  {...register('isWon')} />
            <CheckboxField id="isLost"    label="Counts as Closed-Lost" {...register('isLost')} />
            <CheckboxField id="isDefault" label="Default stage for new opportunities" {...register('isDefault')} />
            {mode === 'edit' && (
              <CheckboxField id="isActive" label="Active (visible in pipeline)" {...register('isActive')} />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : mode === 'create' ? 'Add Stage' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
