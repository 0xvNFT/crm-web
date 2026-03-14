import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface ConfirmDialogProps {
  open: boolean
  onConfirm: (reason?: string) => void
  onCancel: () => void
  title: string
  description: string
  confirmLabel?: string
  pendingLabel?: string
  isPending?: boolean
  /** When true, shows a required reason textarea — maps to ReasonRequest.reason on reject endpoints */
  requireReason?: boolean
  reasonLabel?: string
  reasonPlaceholder?: string
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Delete',
  pendingLabel,
  isPending = false,
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Enter reason...',
}: ConfirmDialogProps) {
  const [reason, setReason] = useState('')

  function handleCancel() {
    setReason('')
    onCancel()
  }

  function handleConfirm() {
    onConfirm(requireReason ? reason : undefined)
    setReason('')
  }

  const canConfirm = !requireReason || reason.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {requireReason && (
          <div className="space-y-1.5">
            <Label>{reasonLabel}</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              rows={3}
              disabled={isPending}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !canConfirm}
          >
            {isPending ? (pendingLabel ?? `${confirmLabel}ing…`) : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
