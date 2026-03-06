import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas/auth'
import { useForgotPassword } from '@/api/endpoints/auth'
import { AuthLayout } from './components/AuthLayout'
import { FormField } from './components/FormField'
import { Button } from '@/components/ui/button'
import { MailCheck } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const mutation = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    await mutation.mutateAsync(data)
    setSent(true)
  }

  return (
    <AuthLayout>
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <MailCheck className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              If an account exists for that address, you&apos;ll receive a reset link shortly.
              The link expires in 1 hour.
            </p>
          </div>
          <Link to="/login" className="text-sm text-primary font-medium hover:underline underline-offset-4">
            Back to sign in
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Forgot password?</h2>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send reset instructions.
            </p>
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

            <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>

          <p className="text-center text-sm">
            <Link to="/login" className="text-primary font-medium hover:underline underline-offset-4">
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  )
}
