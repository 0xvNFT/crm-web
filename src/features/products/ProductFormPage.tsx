import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useProduct, useCreateProduct, useUpdateProduct } from '@/api/endpoints/products'
import { useConfig } from '@/api/endpoints/config'
import { useConfigOptions } from '@/hooks/useConfigOptions'
import { productSchema, type ProductFormData } from '@/schemas/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckboxField } from '@/components/shared/CheckboxField'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { CreateProductRequest, UpdateProductRequest, PharmaProduct } from '@/api/app-types'

// DEA Schedules I–V are codified in US federal law — fixed regulatory constant, not business config
const DEA_SCHEDULES = ['I', 'II', 'III', 'IV', 'V']

// Rendered only after data + config are ready — defaultValues are stable on first useForm call
function ProductForm({ existing, isEdit }: { existing?: PharmaProduct; isEdit: boolean }) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const statusOptions = useConfigOptions('product.status')
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct(id ?? '')
  const isPending = isCreating || isUpdating

  const { register, control, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: isEdit && existing ? {
      ndcNumber:           existing.ndcNumber,
      name:                existing.name,
      genericName:         existing.genericName ?? '',
      manufacturer:        existing.manufacturer ?? '',
      strength:            existing.strength ?? '',
      dosageForm:          existing.dosageForm ?? '',
      packageSize:         existing.packageSize ?? '',
      unitPrice:           existing.unitPrice,
      status:              existing.status ?? 'active',
      controlledSubstance: existing.controlledSubstance ?? false,
      deaSchedule:         existing.deaSchedule ?? '',
    } : {
      ndcNumber: '', name: '', genericName: '', manufacturer: '',
      strength: '', dosageForm: '', packageSize: '',
      unitPrice: 0, status: 'active', controlledSubstance: false, deaSchedule: '',
    },
  })

  function onSubmit(data: ProductFormData) {
    // Build typed payloads — strip empty strings, backend @Pattern/@Enum rejects "" on optional fields
    const commonFields = {
      name:                data.name,
      ndcNumber:           data.ndcNumber,
      unitPrice:           data.unitPrice,
      status:              data.status,
      controlledSubstance: data.controlledSubstance,
      ...(data.genericName   ? { genericName:   data.genericName }   : {}),
      ...(data.manufacturer  ? { manufacturer:  data.manufacturer }  : {}),
      ...(data.strength      ? { strength:      data.strength }      : {}),
      ...(data.dosageForm    ? { dosageForm:    data.dosageForm }    : {}),
      ...(data.packageSize   ? { packageSize:   data.packageSize }   : {}),
      ...(data.deaSchedule   ? { deaSchedule:   data.deaSchedule }   : {}),
    }

    if (isEdit) {
      const payload: UpdateProductRequest = commonFields
      updateProduct(payload, {
        onSuccess: () => {
          toast('Product updated', { variant: 'success' })
          navigate(`/products/${id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    } else {
      const payload: CreateProductRequest = commonFields
      createProduct(payload, {
        onSuccess: (product) => {
          toast('Product created', { variant: 'success' })
          navigate(`/products/${product.id}`)
        },
        onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Update product catalog entry' : 'Add a new product to the catalog'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="rounded-xl border bg-background p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Product Info</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="genericName">Generic Name</Label>
              <Input id="genericName" {...register('genericName')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ndcNumber">NDC Number *</Label>
              <Input id="ndcNumber" {...register('ndcNumber')} className={errors.ndcNumber ? 'border-destructive' : ''} />
              {errors.ndcNumber && <p className="text-xs text-destructive">{errors.ndcNumber.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" {...register('manufacturer')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="strength">Strength</Label>
              <Input id="strength" placeholder="e.g. 500mg" {...register('strength')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dosageForm">Dosage Form</Label>
              <Input id="dosageForm" placeholder="e.g. Tablet, Capsule" {...register('dosageForm')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="packageSize">Package Size</Label>
              <Input id="packageSize" placeholder="e.g. 30 tablets" {...register('packageSize')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="unitPrice">Unit Price (₱) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min={0}
                step={0.01}
                {...register('unitPrice')}
                className={errors.unitPrice ? 'border-destructive' : ''}
              />
              {errors.unitPrice && <p className="text-xs text-destructive">{errors.unitPrice.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Status *</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.status ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-background p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Regulatory</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CheckboxField label="Controlled Substance" id="controlledSubstance" {...register('controlledSubstance')} />

            <div className="space-y-1">
              <Label>DEA Schedule</Label>
              <Controller
                name="deaSchedule"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule…" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEA_SCHEDULES.map((s) => (
                        <SelectItem key={s} value={s}>Schedule {s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Product')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { data: existing, isLoading: isLoadingProduct } = useProduct(id ?? '')
  const { isLoading: isLoadingConfig } = useConfig()

  if (isLoadingConfig || (isEdit && isLoadingProduct)) return <LoadingSpinner />

  return <ProductForm existing={existing} isEdit={isEdit} />
}
