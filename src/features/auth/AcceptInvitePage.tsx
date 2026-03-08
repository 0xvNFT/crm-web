import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import client from '@/api/client'
import { AuthLayout } from './components/AuthLayout'
import { FormField } from './components/FormField'
import { Button } from '@/components/ui/button'
import { parseApiError } from '@/utils/errors'
import type { AcceptInviteRequest } from '@/api/app-types'

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_.#\-])[A-Za-z\d@$!%*?&_.#\-]{8,128}$/

const schema = z
  .object({
    password: z
      .string()
      .regex(
        PASSWORD_REGEX,
        'Password must be 8–128 characters with uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function AcceptInvitePage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: (payload: AcceptInviteRequest) =>
      client.post('/api/auth/accept-invite', payload).then((r) => r.data),
    onSuccess: () => {
      setTimeout(() => navigate('/login'), 2000)
    },
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  function onSubmit(data: FormData) {
    mutate({ token, password: data.password })
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
