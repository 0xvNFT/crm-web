import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '@/api/client'
import type {
  PipelineStage,
  CreatePipelineStageRequest,
  UpdatePipelineStageRequest,
} from '@/api/app-types'

const BASE = '/api/v1/pharma/pipeline-stages'

// ─── Queries ─────────────────────────────────────────────────────────────────

export function usePipelineStages() {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: () => client.get<PipelineStage[]>(BASE).then((res) => res.data),
  })
}

export function usePipelineStage(id: string) {
  return useQuery({
    queryKey: ['pipeline-stages', id],
    queryFn: () => client.get<PipelineStage>(`${BASE}/${id}`).then((res) => res.data),
    enabled: !!id,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreatePipelineStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePipelineStageRequest) =>
      client.post<PipelineStage>(BASE, data).then((res) => res.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pipeline-stages'] }) },
  })
}

export function useUpdatePipelineStage(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePipelineStageRequest) =>
      client.put<PipelineStage>(`${BASE}/${id}`, data).then((res) => res.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pipeline-stages'] }) },
  })
}

export function useDeletePipelineStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => client.delete(`${BASE}/${id}`),
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: ['pipeline-stages', id] })
      qc.invalidateQueries({ queryKey: ['pipeline-stages'] })
    },
  })
}
