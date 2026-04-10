import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChangePassword } from '@/api/endpoints/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { parseApiError } from '@/utils/errors'
import { AuthLayout } from './components/AuthLayout'
import { FormField } from './components/FormField'
import { Button } from '@/components/ui/button'
import { changePasswordSchema, type ChangePasswordFormData } from '@/schemas/auth'
import { toast } from '@/hooks/useToast'

/**
 * Shown immediately after login for operator-provisioned accounts
 * where must_change_password=true. The user cannot navigate away
 * until they complete this step — PrivateRoute enforces the redirect.
 */
export default function ForceChangePasswordPage() {
  const { user, login } = useAuth()
  const { mutate: changePassword, isPending } = useChangePassword()
  const qc = useQueryClient()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  function onSubmit(data: ChangePasswordFormData) {
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          // Update cached user — clear mustChangePassword flag so PrivateRoute stops redirecting
          if (user) {
            const updated = { ...user, mustChangePassword: false }
            login(updated)
            qc.setQueryData(['me'], updated)
          }
          toast('Password changed. Welcome!', { variant: 'success' })
          navigate('/dashboard', { replace: true })
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      }
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Set your password</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Your account requires a new password before you can continue.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            id="currentPassword"
            label="Temporary Password"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <FormField
            id="newPassword"
            label="New Password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <FormField
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <p className="text-xs text-muted-foreground">
            8–128 characters. Must include uppercase, lowercase, number, and special character (@$!%*?&_.#-).
          </p>

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? 'Saving…' : 'Set password and continue'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
