import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import client from '@/api/client'
import { parseApiError } from '@/utils/errors'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm text-center space-y-4">
        {status === 'loading' && (
          <>
            <LoadingSpinner />
            <p className="text-sm text-muted-foreground">Verifying your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-xl font-semibold">Email verified</h1>
            <p className="text-sm text-muted-foreground">
              Your account is active. You can now sign in.
            </p>
            <Link
              to="/login"
              className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-semibold">Verification failed</h1>
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Link
              to="/login"
              className="block text-sm text-primary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
