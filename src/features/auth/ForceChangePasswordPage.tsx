import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useChangePassword } from '@/api/endpoints/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { parseApiError } from '@/utils/errors'
import { AuthLayout } from './components/AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { changePasswordSchema, type ChangePasswordFormData } from '@/schemas/auth'
import { toast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword" className="text-foreground/80">Temporary Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={!!errors.currentPassword}
                className={cn('pr-10', errors.currentPassword && 'border-destructive focus-visible:ring-destructive')}
                {...register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-foreground/80">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                className={cn('pr-10', errors.newPassword && 'border-destructive focus-visible:ring-destructive')}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                className={cn('pr-10', errors.confirmPassword && 'border-destructive focus-visible:ring-destructive')}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

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
