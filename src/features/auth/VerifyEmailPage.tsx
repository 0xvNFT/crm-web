import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import client from '@/api/client'
import { parseApiError } from '@/utils/errors'
import { AuthLayout } from './components/AuthLayout'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

type Status = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [status, setStatus] = useState<Status>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Invalid verification link — no token found.')
      return
    }

    client
      .get('/api/auth/verify', { params: { token } })
      .then(() => setStatus('success'))
      .catch((err: unknown) => {
        setStatus('error')
        setErrorMessage(parseApiError(err))
      })
  }, [token])

  return (
    <AuthLayout>
      <div className="space-y-4 text-center">
        {status === 'loading' && (
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

        {status === 'success' && (
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

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <XCircle className="h-12 w-12 text-destructive" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight">Verification failed</h2>
              <p className="text-sm text-destructive">{errorMessage}</p>
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
