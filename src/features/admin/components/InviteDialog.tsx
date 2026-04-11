import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useInviteStaff } from '@/api/endpoints/users'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { inviteStaffSchema, type InviteStaffFormData } from '@/schemas/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { FormRow } from '@/components/shared/FormRow'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'

interface InviteDialogProps {
  open: boolean
  onClose: () => void
}

export function InviteDialog({ open, onClose }: InviteDialogProps) {
  const { mutate: invite, isPending } = useInviteStaff()
  const roleOptions = useConfigOptions('user.role')

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<InviteStaffFormData>({
    resolver: zodResolver(inviteStaffSchema),
  })

  function onSubmit(data: InviteStaffFormData) {
    invite(data, {
      onSuccess: () => {
        toast('Invitation sent', { variant: 'success' })
        reset()
        onClose()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogDescription>
            An invite link will be emailed to the staff member. They'll use it to set their password and activate their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="First Name" required fieldId="firstName" error={errors.firstName?.message}>
              <Input id="firstName" {...register('firstName')} autoFocus />
            </FormRow>
            <FormRow label="Last Name" required fieldId="lastName" error={errors.lastName?.message}>
              <Input id="lastName" {...register('lastName')} />
            </FormRow>
          </div>

          <FormRow label="Email" required fieldId="email" error={errors.email?.message}>
            <Input id="email" {...register('email')} type="email" />
          </FormRow>

          <FormRow label="Role" required error={errors.role?.message}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>

          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Job Title" fieldId="jobTitle">
              <Input id="jobTitle" {...register('jobTitle')} placeholder="e.g. Sales Rep" />
            </FormRow>
            <FormRow label="Department" fieldId="department">
              <Input id="department" {...register('department')} placeholder="e.g. Field Force" />
            </FormRow>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Sending…' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
