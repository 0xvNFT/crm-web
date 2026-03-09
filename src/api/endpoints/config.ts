import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type { CrmConfig } from '@/api/app-types'

export function useConfig() {
  return useQuery<CrmConfig>({
    queryKey: ['config'],
    queryFn: () => client.get<CrmConfig>('/api/pharma/config').then((r) => r.data),
    staleTime: Infinity, // enum values don't change during a session
    gcTime: Infinity,
  })
}
