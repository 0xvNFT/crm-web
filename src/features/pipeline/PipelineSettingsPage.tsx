import { useState } from 'react'
import { Plus, Pencil, Trash2, Trophy, XCircle } from 'lucide-react'
import {
  usePipelineStages,
  useDeletePipelineStage,
} from '@/api/endpoints/pipelineStages'
import { PageHeader } from '@/components/shared/PageHeader'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { useRole } from '@/hooks/useRole'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PipelineStage } from '@/api/app-types'
import { PipelineStageDialog } from './components/PipelineStageDialog'

export default function PipelineSettingsPage() {
  const { data: stages = [], isLoading, isError, error, refetch } = usePipelineStages()
  const { mutate: deleteStage, isPending: isDeleting } = useDeletePipelineStage()
  const { isManager } = useRole()

  const [showAdd, setShowAdd]       = useState(false)
  const [editStage, setEditStage]   = useState<PipelineStage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PipelineStage | null>(null)

  if (isLoading) return <ListPageSkeleton />
  if (isError)   return <ErrorMessage error={error} onRetry={() => refetch()} />

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pipeline Stages"
        description="Configure the sales stages used in your opportunity pipeline."
        actions={isManager && (
          <Button size="sm" onClick={() => setShowAdd(true)} className="h-8 gap-1.5 text-xs font-medium">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add Stage
          </Button>
        )}
      />

      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        {stages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Trophy className="h-8 w-8 mb-3 opacity-30" strokeWidth={1.5} />
            <p className="text-sm font-medium">No pipeline stages defined</p>
            <p className="text-xs mt-1">Add your first stage to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border/50 bg-muted/20">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide">Order</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide">Stage Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide">Probability</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide">Default</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide">Status</th>
                {isManager && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {stages.map((stage: PipelineStage) => (
                <tr key={stage.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{stage.displayOrder ?? 0}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{stage.name}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{stage.probability}%</td>
                  <td className="px-4 py-3">
                    {stage.won ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Trophy className="h-3 w-3" strokeWidth={1.5} /> Won
                      </span>
                    ) : stage.lost ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                        <XCircle className="h-3 w-3" strokeWidth={1.5} /> Lost
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Open</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {stage.defaultStage && (
                      <span className="text-xs font-medium text-primary">Default</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {stage.active === false ? (
                      <span className="text-xs text-muted-foreground">Inactive</span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-600">Active</span>
                    )}
                  </td>
                  {isManager && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit stage"
                          onClick={() => setEditStage(stage)}
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete stage"
                          onClick={() => setDeleteTarget(stage)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add dialog */}
      {showAdd && (
        <PipelineStageDialog
          mode="create"
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Edit dialog */}
      {editStage && (
        <PipelineStageDialog
          mode="edit"
          stage={editStage}
          onClose={() => setEditStage(null)}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteStage(deleteTarget.id ?? '', {
            onSuccess: () => {
              toast('Stage deleted', { variant: 'success' })
              setDeleteTarget(null)
            },
            onError: (err) => {
              toast(parseApiError(err), { variant: 'destructive' })
              setDeleteTarget(null)
            },
          })
        }}
        title="Delete Pipeline Stage?"
        description={`Remove "${deleteTarget?.name}" from your pipeline. This cannot be undone.`}
        confirmLabel="Delete"
        isPending={isDeleting}
      />
    </div>
  )
}
