import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useInvoice, useUpdateInvoice } from '@/api/endpoints/invoices'
import { invoiceEditSchema, type InvoiceEditFormData } from '@/schemas/invoices'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { FormRow } from '@/components/shared/FormRow'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'

interface InvoiceEditFormProps {
  invoiceId: string
  defaultValues: InvoiceEditFormData
}

export function InvoiceEditForm({ invoiceId, defaultValues }: InvoiceEditFormProps) {
  const navigate = useNavigate()
  const { mutate: updateInvoice, isPending } = useUpdateInvoice(invoiceId)

  const { register, handleSubmit, formState: { errors } } = useForm<InvoiceEditFormData>({
    resolver: zodResolver(invoiceEditSchema),
    defaultValues,
  })

  function onSubmit(data: InvoiceEditFormData) {
    const payload = {
      ...data,
      paymentTerms: data.paymentTerms || undefined,
      shippingAddress: data.shippingAddress || undefined,
      shippingMethod: data.shippingMethod || undefined,
    }
    updateInvoice(payload, {
      onSuccess: () => {
        toast('Invoice updated', { variant: 'success' })
        navigate(`/invoices/${invoiceId}`)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="rounded-xl border bg-background p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice Info</h2>

        <p className="text-xs text-muted-foreground">
          Account and line items cannot be changed after creation. Only header fields are editable on draft invoices.
        </p>

        <FormRow label="Subject" required error={errors.subject?.message}>
          <Input {...register('subject')} className={errors.subject ? 'border-destructive' : ''} />
        </FormRow>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormRow label="Invoice Date" required error={errors.invoiceDate?.message}>
            <Input type="date" {...register('invoiceDate')} className={errors.invoiceDate ? 'border-destructive' : ''} />
          </FormRow>

          <FormRow label="Due Date" required error={errors.dueDate?.message}>
            <Input type="date" {...register('dueDate')} className={errors.dueDate ? 'border-destructive' : ''} />
          </FormRow>

          <FormRow label="Payment Terms">
            <Input {...register('paymentTerms')} placeholder="e.g. Net 30" />
          </FormRow>

          <FormRow label="Currency">
            <Input {...register('currency')} placeholder="PHP" />
          </FormRow>
        </div>

        <FormRow label="Billing Address" required error={errors.billingAddress?.message}>
          <Input {...register('billingAddress')} className={errors.billingAddress ? 'border-destructive' : ''} />
        </FormRow>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormRow label="Shipping Address">
            <Input {...register('shippingAddress')} />
          </FormRow>

          <FormRow label="Shipping Method">
            <Input {...register('shippingMethod')} />
          </FormRow>
        </div>

        <div className="flex items-center gap-2">
          <input id="taxExempt" type="checkbox" className="h-4 w-4 rounded border-input" {...register('taxExempt')} />
          <Label htmlFor="taxExempt" className="text-sm cursor-pointer">Tax Exempt</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : 'Save Changes'}</Button>
        <Button type="button" variant="outline" onClick={() => navigate(`/invoices/${invoiceId}`)}>Cancel</Button>
      </div>
    </form>
  )
}

export function InvoiceEditLoader({ id }: { id: string }) {
  const navigate = useNavigate()
  const { data: invoice, isLoading, isError } = useInvoice(id)

  useEffect(() => {
    if (invoice && invoice.status !== 'draft') {
      toast('Only draft invoices can be edited', { variant: 'destructive' })
      navigate(`/invoices/${id}`, { replace: true })
    }
  }, [invoice, id, navigate])

  if (isLoading) return <LoadingSpinner />
  if (isError || !invoice) return <ErrorMessage message="Invoice not found." />

  const defaultValues: InvoiceEditFormData = {
    subject: invoice.subject ?? '',
    invoiceDate: invoice.invoiceDate ?? '',
    dueDate: invoice.dueDate ?? '',
    billingAddress: invoice.billingAddress ?? '',
    paymentTerms: invoice.paymentTerms ?? '',
    currency: invoice.currency ?? 'PHP',
    shippingAddress: invoice.shippingAddress ?? '',
    shippingMethod: invoice.shippingMethod ?? '',
    taxExempt: invoice.taxExempt ?? false,
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/invoices/${id}`)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Invoice</h1>
          <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
        </div>
      </div>
      <InvoiceEditForm invoiceId={id} defaultValues={defaultValues} />
    </>
  )
}
