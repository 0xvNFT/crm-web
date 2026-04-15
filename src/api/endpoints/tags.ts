import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaTag, PagePharmaTag, CreateTagRequest, UpdateTagRequest, ApplyTagsRequest } from '@/api/app-types'
import type { TagEntityType } from '@/components/shared/EntityTagsSection'

// ─── Tag library — full flat list for dropdowns ───────────────────────────────
export function useAllTags() {
  return useQuery({
    queryKey: ['tags', 'all'],
    queryFn: () =>
      client.get<PharmaTag[]>('/api/v1/pharma/tags/all').then((r) => r.data),
    staleTime: 5 * 60 * 1000, // tag library is semi-static — avoid re-fetching on every picker open
  })
}

// ─── Tag library — paginated for management page ──────────────────────────────
export function useTags(page = 0, size = 20) {
  return useQuery({
    queryKey: ['tags', 'list', { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaTag>('/api/v1/pharma/tags', { params: { page, size, sort: 'name,asc' } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

// ─── Create tag (MANAGER/ADMIN) ───────────────────────────────────────────────
export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTagRequest) =>
      client.post<PharmaTag>('/api/v1/pharma/tags', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}

// ─── Update tag (MANAGER/ADMIN) ───────────────────────────────────────────────
export function useUpdateTag(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateTagRequest) =>
      client.put<PharmaTag>(`/api/v1/pharma/tags/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}

// ─── Delete tag (MANAGER/ADMIN) ───────────────────────────────────────────────
export function useDeleteTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/pharma/tags/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}

// ─── Tags on a specific entity ────────────────────────────────────────────────
export function useEntityTags(entityType: TagEntityType, entityId: string) {
  return useQuery({
    queryKey: ['tags', 'entity', entityType, entityId],
    queryFn: () =>
      client
        .get<PharmaTag[]>(`/api/v1/pharma/tags/entity/${entityType}/${entityId}`)
        .then((r) => r.data),
    enabled: !!entityId,
  })
}

// ─── Apply tags to an entity ──────────────────────────────────────────────────
export function useApplyTags(entityType: TagEntityType, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ApplyTagsRequest) =>
      client
        .post<PharmaTag[]>(`/api/v1/pharma/tags/entity/${entityType}/${entityId}`, data)
        .then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['tags', 'entity', entityType, entityId] }),
  })
}

// ─── Remove a tag from an entity ─────────────────────────────────────────────
export function useRemoveTag(entityType: TagEntityType, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tagId: string) =>
      client.delete(`/api/v1/pharma/tags/entity/${entityType}/${entityId}/${tagId}`),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['tags', 'entity', entityType, entityId] }),
  })
}
