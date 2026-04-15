import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaNote, PagePharmaNote, CreateNoteRequest, UpdateNoteRequest } from '@/api/app-types'

// ─── List notes for a specific entity — pinned first, newest first ────────────
export function useNotesByEntity(entityType: string, entityId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: ['notes', entityType, entityId, { page, size }],
    queryFn: () =>
      client
        .get<PagePharmaNote>(`/api/v1/pharma/notes/entity/${entityType}/${entityId}`, {
          params: { page, size },
        })
        .then((r) => r.data),
    enabled: !!entityId,
    placeholderData: (prev) => prev,
  })
}

// ─── Create a note on any entity ─────────────────────────────────────────────
export function useCreateNote(entityType: string, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateNoteRequest) =>
      client.post<PharmaNote>('/api/v1/pharma/notes', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', entityType, entityId] }),
  })
}

// ─── Update a note ────────────────────────────────────────────────────────────
export function useUpdateNote(entityType: string, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteRequest }) =>
      client.put<PharmaNote>(`/api/v1/pharma/notes/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', entityType, entityId] }),
  })
}

// ─── Delete a note ────────────────────────────────────────────────────────────
export function useDeleteNote(entityType: string, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`/api/v1/pharma/notes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', entityType, entityId] }),
  })
}

// ─── Toggle pin (MANAGER/ADMIN only) ─────────────────────────────────────────
export function useToggleNotePin(entityType: string, entityId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      client.post<PharmaNote>(`/api/v1/pharma/notes/${id}/pin`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes', entityType, entityId] }),
  })
}
