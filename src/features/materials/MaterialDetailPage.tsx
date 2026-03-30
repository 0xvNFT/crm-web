import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, CheckCircle, Archive, Pencil, X, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMaterial, useUpdateMaterial, useApproveMaterial, useArchiveMaterial } from '@/api/endpoints/materials'
import type { UpdateMaterialRequest } from '@/api/app-types'
import { useRole } from '@/hooks/useRole'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormRow } from '@/components/shared/FormRow'
import { materialEditSchema, type MaterialEditFormData } from '@/schemas/materials'
import { formatDate } from '@/utils/formatters'
import { parseApiError } from '@/utils/errors'
import { toast } from '@/hooks/useToast'

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value?: string | number | boolean | null }) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : String(value)
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{display}</p>
    </div>
  )
}

export default function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isManager } = useRole()
  const [editing, setEditing] = useState(false)
  const [showApprove, setShowApprove] = useState(false)
  const [showArchive, setShowArchive] = useState(false)

  const { data: material, isLoading, isError } = useMaterial(id ?? '')
  const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial(id ?? '')
  const { mutate: approveMaterial, isPending: isApproving } = useApproveMaterial()
  const { mutate: archiveMaterial, isPending: isArchiving } = useArchiveMaterial()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaterialEditFormData>({
    resolver: zodResolver(materialEditSchema),
  })

  if (isLoading) return <LoadingSpinner />
  if (isError || !material) return <ErrorMessage message="Material not found." />

  const status = material.status?.toLowerCase() ?? ''
  const canEdit = isManager && (status === 'draft' || status === 'pending_approval')
  const canApprove = isManager && status === 'pending_approval'
  const canArchive = isManager && status === 'approved'

  function startEdit() {
    reset({
      title: material?.title ?? '',
      description: material?.description ?? '',
      fileName: material?.fileName ?? '',
      fileType: material?.fileType ?? '',
      category: material?.category ?? '',
      subCategory: material?.subCategory ?? '',
      versionNumber: material?.versionNumber ?? '',
      keywords: material?.keywords ?? '',
      languageCode: material?.languageCode ?? '',
      storageUrl: material?.storageUrl ?? '',
      publishDate: material?.publishDate ?? '',
      expirationDate: material?.expirationDate ?? '',
    })
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    reset()
  }

  function onSubmit(data: MaterialEditFormData) {
    // Build typed payload — strip empty strings
    const payload: UpdateMaterialRequest = {
      ...(data.title          ? { title:          data.title }          : {}),
      ...(data.description    ? { description:    data.description }    : {}),
      ...(data.fileName       ? { fileName:       data.fileName }       : {}),
      ...(data.fileType       ? { fileType:       data.fileType }       : {}),
      ...(data.category       ? { category:       data.category }       : {}),
      ...(data.subCategory    ? { subCategory:    data.subCategory }    : {}),
      ...(data.versionNumber  ? { versionNumber:  data.versionNumber }  : {}),
      ...(data.keywords       ? { keywords:       data.keywords }       : {}),
      ...(data.languageCode   ? { languageCode:   data.languageCode }   : {}),
      ...(data.storageUrl     ? { storageUrl:     data.storageUrl }     : {}),
      ...(data.publishDate    ? { publishDate:    data.publishDate }    : {}),
      ...(data.expirationDate ? { expirationDate: data.expirationDate } : {}),
      ...(data.status         ? { status:         data.status }         : {}),
    }
    updateMaterial(payload, {
      onSuccess: () => {
        toast('Material updated', { variant: 'success' })
        setEditing(false)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{material.title}</h1>
            {material.status && <StatusBadge status={material.status.toUpperCase()} />}
            {material.isCurrent && (
              <span className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                Current Version
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{material.fileName}</p>
        </div>

        {!editing && (
          <div className="flex items-center gap-2 shrink-0">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
            {canApprove && (
              <Button size="sm" onClick={() => setShowApprove(true)} disabled={isApproving}>
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Approve
              </Button>
            )}
            {canArchive && (
              <Button size="sm" variant="outline" onClick={() => setShowArchive(true)} disabled={isArchiving}>
                <Archive className="h-3.5 w-3.5 mr-1.5" />
                Archive
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showApprove}
        onCancel={() => setShowApprove(false)}
        onConfirm={() =>
          approveMaterial(id!, {
            onSuccess: () => {
              toast('Material approved', { variant: 'success' })
              setShowApprove(false)
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Approve Material?"
        description="This will mark the material as approved and set it as the current version."
        confirmLabel="Approve"
        isPending={isApproving}
      />

      <ConfirmDialog
        open={showArchive}
        onCancel={() => setShowArchive(false)}
        onConfirm={() =>
          archiveMaterial(id!, {
            onSuccess: () => {
              toast('Material archived', { variant: 'success' })
              setShowArchive(false)
            },
            onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
          })
        }
        title="Archive Material?"
        description="This will archive the material and mark it as no longer current. This cannot be easily reversed."
        confirmLabel="Archive"
        isPending={isArchiving}
      />

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-xl border bg-background p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Edit Material</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormRow label="Title" error={errors.title?.message} className="sm:col-span-2">
                <Input {...register('title')} autoFocus />
              </FormRow>
              <FormRow label="File Name" error={errors.fileName?.message}>
                <Input {...register('fileName')} />
              </FormRow>
              <FormRow label="File Type" error={errors.fileType?.message}>
                <Input {...register('fileType')} placeholder="e.g. PDF, Video" />
              </FormRow>
              <FormRow label="Category" error={errors.category?.message}>
                <Input {...register('category')} placeholder="e.g. Product Brochure" />
              </FormRow>
              <FormRow label="Sub-Category" error={errors.subCategory?.message}>
                <Input {...register('subCategory')} />
              </FormRow>
              <FormRow label="Version Number" error={errors.versionNumber?.message}>
                <Input {...register('versionNumber')} placeholder="e.g. 1.0.0" />
              </FormRow>
              <FormRow label="Language Code" error={errors.languageCode?.message}>
                <Input {...register('languageCode')} placeholder="e.g. en" />
              </FormRow>
              <FormRow label="Keywords" error={errors.keywords?.message}>
                <Input {...register('keywords')} placeholder="comma-separated" />
              </FormRow>
              <FormRow label="Storage URL" error={errors.storageUrl?.message}>
                <Input {...register('storageUrl')} placeholder="https://…" />
              </FormRow>
              <FormRow label="Publish Date" error={errors.publishDate?.message}>
                <Input {...register('publishDate')} type="date" />
              </FormRow>
              <FormRow label="Expiration Date" error={errors.expirationDate?.message}>
                <Input {...register('expirationDate')} type="date" />
              </FormRow>
              <FormRow label="Description" error={errors.description?.message} className="sm:col-span-2">
                <Textarea {...register('description')} rows={3} />
              </FormRow>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button type="button" variant="outline" onClick={cancelEdit} disabled={isUpdating}>
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              {isUpdating ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      {/* View mode */}
      {!editing && (
        <div className="space-y-4">
          <DetailSection title="File Info">
            <DetailField label="Title" value={material.title} />
            <DetailField label="File Name" value={material.fileName} />
            <DetailField label="File Type" value={material.fileType} />
            <DetailField label="Version" value={material.versionNumber} />
            <DetailField label="Language" value={material.languageCode} />
            <DetailField label="Is Current" value={material.isCurrent} />
          </DetailSection>

          <DetailSection title="Classification">
            <DetailField label="Category" value={material.category} />
            <DetailField label="Sub-Category" value={material.subCategory} />
            <DetailField label="Keywords" value={material.keywords} />
          </DetailSection>

          <DetailSection title="Availability">
            <DetailField label="Publish Date" value={formatDate(material.publishDate)} />
            <DetailField label="Expiration Date" value={formatDate(material.expirationDate)} />
            <DetailField label="Owner" value={material.ownerName} />
          </DetailSection>

          {material.storageUrl && (
            <div className="rounded-xl border bg-background p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <span className="text-sm text-muted-foreground truncate">{material.storageUrl}</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={material.storageUrl} target="_blank" rel="noopener noreferrer">
                  Open File
                </a>
              </Button>
            </div>
          )}

          {material.description && (
            <div className="rounded-xl border bg-background p-5 space-y-2">
              <h2 className="text-sm font-semibold text-foreground">Description</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{material.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
