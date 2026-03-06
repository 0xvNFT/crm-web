import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { useLogin, useResendVerification } from '@/api/endpoints/auth'
import { useAuth } from '@/hooks/useAuth'
import { parseApiError } from '@/utils/errors'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const loginMutation = useLogin()
  const resendMutation = useResendVerification()
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendSent, setResendSent] = useState(false)

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setUnverifiedEmail(null)
    setResendSent(false)
    try {
      const user = await loginMutation.mutateAsync(data)
      login(user)
      navigate(from, { replace: true })
    } catch (err) {
      const msg = parseApiError(err)
      if (msg.toLowerCase().includes('not verified') || msg.toLowerCase().includes('verify')) {
        setUnverifiedEmail(data.email)
      }
    }
  }

  async function handleResend() {
    if (!unverifiedEmail) return
    await resendMutation.mutateAsync({ email: unverifiedEmail })
    setResendSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-primary">PharmaForce</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
          </div>

          {loginMutation.error && !unverifiedEmail && (
            <p className="text-sm text-destructive text-center">{parseApiError(loginMutation.error)}</p>
          )}

          {unverifiedEmail && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-center space-y-2">
              <p className="text-destructive">Email not verified. Check your inbox or resend the link.</p>
              {resendSent ? (
                <p className="text-muted-foreground">Verification email sent. Check your inbox.</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  className="text-primary underline-offset-4 hover:underline disabled:opacity-50"
                >
                  {resendMutation.isPending ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-2 text-sm">
          <Link to="/forgot-password" className="text-primary underline-offset-4 hover:underline">
            Forgot your password?
          </Link>
          <p className="text-muted-foreground">
            No account?{' '}
            <Link to="/register" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
