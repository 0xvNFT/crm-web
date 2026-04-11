import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUpdateStaff, useStaffSearch } from '@/api/endpoints/users'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { useDebounce } from '@/hooks/useDebounce'
import { editStaffSchema, type EditStaffFormData } from '@/schemas/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { FormRow } from '@/components/shared/FormRow'
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

  // Reports To combobox state
  const [managerQuery, setManagerQuery] = useState('')
  const debouncedManagerQuery = useDebounce(managerQuery, 300)
  const { data: managerResults, isLoading: isSearchingManagers } = useStaffSearch(debouncedManagerQuery)
  const managerOptions: ComboboxOption[] = (managerResults ?? [])
    .filter((u) => u.id !== user?.id) // cannot report to yourself
    .map((u) => ({
      value: u.id!,
      label: u.fullName ?? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    }))

  // Pre-populate the combobox label if the user already has a manager set
  const existingManager = user?.manager
  const selectedManagerOption: ComboboxOption | undefined = existingManager?.id
    ? { value: existingManager.id, label: existingManager.fullName ?? `${existingManager.firstName ?? ''} ${existingManager.lastName ?? ''}`.trim() }
    : undefined

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<EditStaffFormData>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: user ? {
      role:        (user.roles?.[0]?.name as EditStaffFormData['role']) ?? undefined,
      firstName:   user.firstName ?? '',
      lastName:    user.lastName ?? '',
      jobTitle:    user.jobTitle ?? '',
      department:  user.department ?? '',
      phoneWork:   user.phoneWork ?? '',
      phoneMobile: user.phoneMobile ?? '',
      managerId:   existingManager?.id ?? undefined,
    } : {},
  })

  function onSubmit(data: EditStaffFormData) {
    // Strip empty strings; managerId/clearManager are mutually exclusive — enforced in onChange
    const payload = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '' && v !== undefined)
    ) as EditStaffFormData

    updateStaff(payload, {
      onSuccess: () => {
        toast('Staff member updated', { variant: 'success' })
        onClose()
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  function handleManagerChange(value: string) {
    if (value) {
      // Manager selected — send managerId, never clearManager
      setValue('managerId', value)
      setValue('clearManager', undefined)
    } else {
      // Field cleared — send clearManager: true, never managerId
      setValue('managerId', undefined)
      setValue('clearManager', true)
    }
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
            <FormRow label="First Name" required fieldId="firstName" error={errors.firstName?.message}>
              <Input id="firstName" {...register('firstName')} />
            </FormRow>
            <FormRow label="Last Name" required fieldId="lastName" error={errors.lastName?.message}>
              <Input id="lastName" {...register('lastName')} />
            </FormRow>
          </div>

          <FormRow label="Role" error={errors.role?.message}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? undefined} onValueChange={field.onChange}>
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

          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Work Phone" fieldId="phoneWork">
              <Input id="phoneWork" {...register('phoneWork')} placeholder="+63 2 8xxx xxxx" />
            </FormRow>
            <FormRow label="Mobile" fieldId="phoneMobile">
              <Input id="phoneMobile" {...register('phoneMobile')} placeholder="+63 9xx xxx xxxx" />
            </FormRow>
          </div>

          {/* Reports To — builds the manager hierarchy */}
          <FormRow label="Reports To" error={errors.managerId?.message}>
            <Controller
              name="managerId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={handleManagerChange}
                  options={managerOptions}
                  selectedOption={field.value ? selectedManagerOption : undefined}
                  placeholder="Search staff…"
                  searchPlaceholder="Type name…"
                  onSearchChange={setManagerQuery}
                  isLoading={isSearchingManagers}
                />
              )}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Sets who this person reports to. MANAGERs only see team data once this is set.
            </p>
          </FormRow>

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
