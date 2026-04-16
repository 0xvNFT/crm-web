import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProduct } from '@/api/endpoints/products'
import { EntityHistorySection } from '@/components/shared/EntityHistorySection'
import { EntityNotesSection } from '@/components/shared/EntityNotesSection'
import { EntityTagsSection } from '@/components/shared/EntityTagsSection'
import { useRole } from '@/hooks/useRole'
import { DetailPageSkeleton } from '@/components/shared/DetailPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/utils/formatters'
import { DetailSection, DetailField } from '@/components/shared/DetailSection'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useRole()
  const { data: product, isLoading, isError } = useProduct(id ?? '')

  if (isLoading) return <DetailPageSkeleton />
  if (isError || !product) return <ErrorMessage message="Product not found." />

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{product.name}</h1>
            {product.status && <StatusBadge status={product.status} />}
          </div>
          {product.genericName && (
            <p className="mt-1 text-sm text-muted-foreground">{product.genericName}</p>
          )}
        </div>
        {isAdmin && (
          <Button variant="outline" onClick={() => navigate(`/products/${id}/edit`)}>
            Edit
          </Button>
        )}
      </div>

      <DetailSection title="Product Info">
        <DetailField label="Name" value={product.name} />
        <DetailField label="Generic Name" value={product.genericName} />
        <DetailField label="NDC Number" value={product.ndcNumber} />
        <DetailField label="Manufacturer" value={product.manufacturer} />
        <DetailField label="Strength" value={product.strength} />
        <DetailField label="Dosage Form" value={product.dosageForm} />
        <DetailField label="Package Size" value={product.packageSize} />
        <DetailField label="Unit Price" value={product.unitPrice != null ? formatCurrency(product.unitPrice) : null} />
      </DetailSection>

      <DetailSection title="Regulatory">
        <DetailField label="Controlled Substance" value={product.controlledSubstance} />
        <DetailField label="DEA Schedule" value={product.deaSchedule} />
      </DetailSection>

      <EntityTagsSection entityType="PharmaProduct" entityId={id ?? ''} />
          <EntityNotesSection entityType="PharmaProduct" entityId={id ?? ''} />
      <EntityHistorySection entityType="PharmaProduct" entityId={id ?? ''} />
    </div>
  )
}
