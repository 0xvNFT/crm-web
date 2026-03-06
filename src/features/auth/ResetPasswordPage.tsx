import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/auth'
import { useResetPassword } from '@/api/endpoints/auth'
import { parseApiError } from '@/utils/errors'
import { AuthLayout } from './components/AuthLayout'
import { FormField } from './components/FormField'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const mutation = useResetPassword()

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
          <FormField
            id="newPassword"
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <FormField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

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
