import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/schemas/auth'
import { useRegister } from '@/api/endpoints/auth'
import { parseApiError } from '@/utils/errors'
import { AuthLayout } from './components/AuthLayout'
import { FormField } from './components/FormField'
import { Button } from '@/components/ui/button'

// VITE_REGISTRATION_ENABLED=true  -> self-registration enabled, full form shown
// VITE_REGISTRATION_ENABLED=false -> tenant provisioning is managed externally, show notice
const registrationEnabled = import.meta.env.VITE_REGISTRATION_ENABLED === 'true'

function RegistrationDisabled() {
  return (
    <AuthLayout>
      <div className="space-y-4 text-center">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Registration unavailable</h2>
          <p className="text-sm text-muted-foreground">
            New company accounts are set up by our team. Please contact your administrator.
          </p>
        </div>
        <Link to="/login" className="text-sm text-primary font-medium hover:underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  )
}

function RegistrationSuccess() {
  return (
    <AuthLayout>
      <div className="space-y-4 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to your address. Click it to activate your account, then sign in.
          </p>
        </div>
        <Link to="/login" className="text-sm text-primary font-medium hover:underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  )
}

export default function RegisterPage() {
  const [done, setDone] = useState(false)
  const mutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  if (!registrationEnabled) return <RegistrationDisabled />
  if (done) return <RegistrationSuccess />

  async function onSubmit(data: RegisterFormData) {
    try {
      await mutation.mutateAsync({
        tenantName: data.tenantName,
        tenantSlug: data.tenantSlug,
        vertical: 'pharma',
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })
      setDone(true)
    } catch {
      // error shown via mutation.error below
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h2>
          <p className="text-sm text-muted-foreground">Register your company on CRM CDTS</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Company section */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Company
            </p>
            <FormField
              id="tenantName"
              label="Company name"
              type="text"
              error={errors.tenantName?.message}
              {...register('tenantName')}
            />
            <FormField
              id="tenantSlug"
              label="Company slug"
              hint="(unique URL identifier)"
              type="text"
              placeholder="acme-pharma"
              error={errors.tenantSlug?.message}
              {...register('tenantSlug')}
            />
          </div>

          {/* Admin account section */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-1">
              Admin account
            </p>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                id="firstName"
                label="First name"
                type="text"
                autoComplete="given-name"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <FormField
                id="lastName"
                label="Last name"
                type="text"
                autoComplete="family-name"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
            <FormField
              id="email"
              label="Work email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <FormField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          {mutation.error && (
            <p className="text-sm text-destructive text-center rounded-md bg-destructive/5 border border-destructive/20 px-3 py-2">
              {parseApiError(mutation.error)}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
