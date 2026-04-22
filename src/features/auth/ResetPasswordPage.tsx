import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/auth'
import { useResetPassword } from '@/api/endpoints/auth'
import { parseApiError } from '@/utils/errors'
import { AuthLayout } from './components/AuthLayout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const mutation = useResetPassword()
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  async function onSubmit(data: ResetPasswordFormData) {
    try {
      await mutation.mutateAsync({ token, newPassword: data.newPassword })
      navigate('/login', { state: { message: 'Password reset successfully. Please sign in.' } })
    } catch {
      // error shown via mutation.error
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="space-y-4 text-center">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Invalid reset link</h2>
            <p className="text-sm text-destructive">
              This link is missing a token. Please request a new one.
            </p>
          </div>
          <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline underline-offset-4">
            Request new reset link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Set new password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your new password. The link expires in 1 hour.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-foreground/80">New password</Label>
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
            <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm password</Label>
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

          {mutation.error && (
            <p className="text-sm text-destructive text-center rounded-md bg-destructive/5 border border-destructive/20 px-3 py-2">
              {parseApiError(mutation.error)}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Set new password'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
