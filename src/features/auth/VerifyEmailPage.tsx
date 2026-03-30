import { useSearchParams, Link } from 'react-router-dom'
import { useVerifyEmail } from '@/api/endpoints/auth'
import { parseApiError } from '@/utils/errors'
import { AuthLayout } from './components/AuthLayout'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const { isLoading, isSuccess, isError, error } = useVerifyEmail(token)

  if (!token) {
    return (
      <AuthLayout>
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <XCircle className="h-12 w-12 text-destructive" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Verification failed</h2>
            <p className="text-sm text-destructive">Invalid verification link — no token found.</p>
          </div>
          <Link to="/login" className="text-sm text-primary font-medium hover:underline underline-offset-4">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-4 text-center">
        {isLoading && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-primary animate-spin" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Verifying your email…</h2>
              <p className="text-sm text-muted-foreground">Just a moment.</p>
            </div>
          </>
        )}

        {isSuccess && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Email verified</h2>
              <p className="text-sm text-muted-foreground">
                Your account is active. You can now sign in.
              </p>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link to="/login">Sign in</Link>
            </Button>
          </>
        )}

        {isError && (
          <>
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-destructive" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Verification failed</h2>
              <p className="text-sm text-destructive">{parseApiError(error)}</p>
            </div>
            <Link to="/login" className="text-sm text-primary font-medium hover:underline underline-offset-4">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
