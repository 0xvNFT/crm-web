import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaProduct, PagePharmaProduct, PharmaProductBatch } from '@/api/app-types'

export function useProducts(page = 0, size = 20) {
  return useQuery({
    queryKey: ['products', 'list', { page, size }],
    queryFn: () =>
      client.get<PagePharmaProduct>('/api/pharma/products', { params: { page, size } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useProductSearch(q: string) {
  return useQuery({
    queryKey: ['products', 'search', q],
    queryFn: () =>
      client.get<PharmaProduct[]>('/api/pharma/products/search', { params: { name: q } }).then((r) => r.data),
    enabled: q.trim().length >= 2,
  })
}

export function useProductBatches(productId: string) {
  return useQuery({
    queryKey: ['products', productId, 'batches'],
    queryFn: () =>
      client.get<PharmaProductBatch[]>(`/api/pharma/products/${productId}/batches`).then((r) => r.data),
    enabled: !!productId,
  })
}
