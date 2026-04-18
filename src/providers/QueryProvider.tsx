import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // QueryClient must be created inside useState to allow GC between renders and prevent
  // stale data leaking between test runs. Module-level singletons are not GC-able.
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
