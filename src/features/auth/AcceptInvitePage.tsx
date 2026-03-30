import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAcceptInvite } from '@/api/endpoints/auth'
import { AuthLayout } from './components/AuthLayout'
import { FormField } from './components/FormField'
import { Button } from '@/components/ui/button'
import { parseApiError } from '@/utils/errors'
import { acceptInviteSchema, type AcceptInviteFormData } from '@/schemas/auth'

export default function AcceptInvitePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const { mutate, isPending, isSuccess, error } = useAcceptInvite()

  const { register, handleSubmit, formState: { errors } } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
  })

  function onSubmit(data: AcceptInviteFormData) {
    mutate({ token, newPassword: data.password }, {
      onSuccess: () => {
        setTimeout(() => navigate('/login'), 2000)
      },
    })
  }

  // Missing or invalid token — caught by the backend, but show early if token is absent
  if (!token) {
    return (
      <AuthLayout>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Invalid link</h1>
          <p className="text-sm text-muted-foreground">
            This invite link is missing a token. Please use the link from your email.
          </p>
          <Button variant="outline" onClick={() => navigate('/login')} className="mt-4">
            Back to login
          </Button>
        </div>
      </AuthLayout>
    )
  }

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Password set!</h1>
          <p className="text-sm text-muted-foreground">
            Your account is active. Redirecting you to login…
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Set your password</h1>
          <p className="text-sm text-muted-foreground">
            Create a password to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="New Password"
            type="password"
            autoComplete="new-password"
            autoFocus
            error={errors.password?.message}
            {...register('password')}
          />
          <FormField
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {error && (
            <p className="text-sm text-destructive">{parseApiError(error)}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Activating…' : 'Activate Account'}
          </Button>
        </form>
      </div>
    </AuthLayout>
  )
}
