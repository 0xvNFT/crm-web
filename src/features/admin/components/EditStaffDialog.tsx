import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateStaff } from '@/api/endpoints/users'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { editStaffSchema, type EditStaffFormData } from '@/schemas/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { User } from '@/api/app-types'

interface EditStaffDialogProps {
  user: User | null
  onClose: () => void
}

// key={user?.id} must be set at the call site to remount this component per user,
// ensuring defaultValues are stable and not stale from a previous selection.
export function EditStaffDialog({ user, onClose }: EditStaffDialogProps) {
  const { mutate: updateStaff, isPending } = useUpdateStaff(user?.id ?? '')
  const roleOptions = useConfigOptions('user.role')

  const { register, handleSubmit, control, formState: { errors } } = useForm<EditStaffFormData>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: user ? {
      role:        (user.roles?.[0]?.name as EditStaffFormData['role']) ?? undefined,
      firstName:   user.firstName ?? '',
      lastName:    user.lastName ?? '',
      jobTitle:    user.jobTitle ?? '',
      department:  user.department ?? '',
      phoneWork:   user.phoneWork ?? '',
      phoneMobile: user.phoneMobile ?? '',
    } : {},
  })

  function onSubmit(data: EditStaffFormData) {
    updateStaff(data, {
      onSuccess: () => {
        toast('Staff member updated', { variant: 'success' })
        onClose()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <Dialog open={!!user} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update {user?.fullName ?? 'staff member'}'s profile and role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input {...register('firstName')} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input {...register('lastName')} />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Job Title</Label>
              <Input {...register('jobTitle')} placeholder="e.g. Sales Rep" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Department</Label>
              <Input {...register('department')} placeholder="e.g. Field Force" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Work Phone</Label>
              <Input {...register('phoneWork')} placeholder="+63 2 8xxx xxxx" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Mobile</Label>
              <Input {...register('phoneMobile')} placeholder="+63 9xx xxx xxxx" />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
