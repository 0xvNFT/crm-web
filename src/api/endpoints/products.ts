import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaProduct, PagePharmaProduct, PharmaProductBatch, CreateProductRequest, UpdateProductRequest } from '@/api/app-types'

export function useProducts(page = 0, size = 20) {
  return useQuery({
    queryKey: ['products', 'list', { page, size }],
    queryFn: () =>
      client.get<PagePharmaProduct>('/api/pharma/products', { params: { page, size, sort: 'name,asc' } }).then((r) => r.data),
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

export function useCurrentPrice(productId: string, accountId: string) {
  return useQuery({
    queryKey: ['pricing', 'current', productId, accountId],
    queryFn: () =>
      client.get<number>('/api/pharma/prices/current', { params: { productId, accountId } }).then((r) => r.data),
    enabled: !!productId && !!accountId,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => client.get<PharmaProduct>(`/api/pharma/products/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      client.post<PharmaProduct>('/api/pharma/products', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateProductRequest) =>
      client.put<PharmaProduct>(`/api/pharma/products/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products', id] })
      qc.invalidateQueries({ queryKey: ['products', 'list'] })
    },
  })
}
