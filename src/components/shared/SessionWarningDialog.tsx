import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SessionWarningDialogProps {
  open: boolean
  secondsLeft: number
  isPending: boolean
  onStay: () => void
  onSignOut: () => void
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SessionWarningDialog({ open, secondsLeft, isPending, onStay, onSignOut }: SessionWarningDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Your session is expiring</DialogTitle>
          <DialogDescription>
            You will be signed out in{' '}
            <span className="font-semibold text-foreground tabular-nums">
              {formatCountdown(secondsLeft)}
            </span>
            . Do you want to stay signed in?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onSignOut} disabled={isPending}>
            Sign out
          </Button>
          <Button onClick={onStay} disabled={isPending}>
            {isPending ? 'Extending…' : 'Stay signed in'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
