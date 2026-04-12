import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { useLogin, useResendVerification } from '@/api/endpoints/auth'
import { useAuth } from '@/hooks/useAuth'
import { parseApiError } from '@/utils/errors'
import { AuthLayout } from './components/AuthLayout'
import { FormField } from './components/FormField'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const loginMutation = useLogin()
  const resendMutation = useResendVerification()
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [resendSent, setResendSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
      navigate(user.mustChangePassword ? '/change-password' : from, { replace: true })
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
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your AlphaForce CRM account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline underline-offset-4">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <FormField
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                error={errors.password?.message}
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {loginMutation.error && !unverifiedEmail && (
            <p className="text-sm text-destructive text-center rounded-md bg-destructive/5 border border-destructive/20 px-3 py-2">
              {parseApiError(loginMutation.error)}
            </p>
          )}

          {unverifiedEmail && (
            <div className="rounded-md border border-warning/30 bg-warning/8 px-4 py-3 text-sm space-y-1.5">
              <p className="font-medium text-foreground">Email not verified</p>
              <p className="text-xs text-muted-foreground">
                Check your inbox for the verification link.
              </p>
              {resendSent ? (
                <p className="text-xs text-muted-foreground">Verification email sent.</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                  className="text-xs text-primary hover:underline underline-offset-4 disabled:opacity-50"
                >
                  {resendMutation.isPending ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {import.meta.env.VITE_REGISTRATION_ENABLED === 'true' && (
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline underline-offset-4">
              Create one
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
