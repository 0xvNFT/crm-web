import { useState } from 'react'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import axios from 'axios'
import { toast } from '@/hooks/useToast'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // QueryClient must be created inside useState to allow GC between renders and prevent
  // stale data leaking between test runs. Module-level singletons are not GC-able.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Global query error handler — fires for background queries that have no onError.
        // Mutations handle their own errors via onError callbacks and never reach this.
        // Kept here (not in client.ts interceptor) to avoid double-toast when mutations fail.
        queryCache: new QueryCache({
          onError: (error) => {
            if (axios.isCancel(error)) return
            if (!axios.isAxiosError(error)) return
            const status = error.response?.status
            if (status === 401) return // handled by authEvents in client.ts
            if (!error.response) {
              toast('Network error — check your connection', { variant: 'destructive' })
            } else if (status !== undefined && status >= 500) {
              toast('Server error — please try again later', { variant: 'destructive' })
            }
          },
        }),
        defaultOptions: {
          queries: {
            // staleTime: 0 (default) — entity data changes under concurrent users.
            // Config and auth override this with Infinity at the hook level.
            retry: 1,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
