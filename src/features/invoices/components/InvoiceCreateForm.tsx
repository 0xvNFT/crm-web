import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useCreateInvoice } from '@/api/endpoints/invoices'
import { useAccountSearch } from '@/api/endpoints/accounts'
import { useContactSearch } from '@/api/endpoints/contacts'
import { useProductSearch } from '@/api/endpoints/products'
import { invoiceCreateSchema, type InvoiceCreateFormData } from '@/schemas/invoices'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormRow } from '@/components/shared/FormRow'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PharmaAccount, PharmaContact, PharmaProduct } from '@/api/app-types'

export function InvoiceCreateForm() {
  const navigate = useNavigate()

  const [accountQuery, setAccountQuery] = useState('')
  const [cachedAccounts, setCachedAccounts] = useState<PharmaAccount[]>([])
  const [contactQuery, setContactQuery] = useState('')
  const [cachedContacts, setCachedContacts] = useState<PharmaContact[]>([])
  const [productQueries, setProductQueries] = useState<string[]>([''])
  const [cachedProducts, setCachedProducts] = useState<PharmaProduct[]>([])

  const debouncedAccountQuery = useDebounce(accountQuery, 300)
  const debouncedContactQuery = useDebounce(contactQuery, 300)
  const debouncedProductQuery = useDebounce(productQueries[productQueries.length - 1] ?? '', 300)

  const { data: accountResults, isLoading: isSearchingAccounts } = useAccountSearch(debouncedAccountQuery)
  const { data: contactResults, isLoading: isSearchingContacts } = useContactSearch(debouncedContactQuery)
  const { data: productResults } = useProductSearch(debouncedProductQuery)

  const mergedAccounts = [
    ...cachedAccounts,
    ...(accountResults ?? []).filter((a) => !cachedAccounts.find((c) => c.id === a.id)),
  ]
  const mergedContacts = [
    ...cachedContacts,
    ...(contactResults ?? []).filter((c) => !cachedContacts.find((x) => x.id === c.id)),
  ]
  const mergedProducts = [
    ...cachedProducts,
    ...(productResults ?? []).filter((p) => !cachedProducts.find((x) => x.id === p.id)),
  ]

  const accountOptions = mergedAccounts.filter((a) => a.id && a.name).map((a) => ({ value: a.id!, label: a.name! }))
  const contactOptions = mergedContacts.filter((c) => c.id).map((c) => ({
    value: c.id!,
    label: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
  }))
  const productOptions = mergedProducts.filter((p) => p.id && p.name).map((p) => ({
    value: p.id!, label: p.name!, sublabel: p.unitPrice != null ? `₱${p.unitPrice}` : undefined,
  }))

  const { mutate: createInvoice, isPending } = useCreateInvoice()

  const { control, register, handleSubmit, formState: { errors } } = useForm<InvoiceCreateFormData>({
    resolver: zodResolver(invoiceCreateSchema),
    defaultValues: {
      accountId: '', contactId: '', subject: '', invoiceDate: '', dueDate: '',
      billingAddress: '', paymentTerms: '', currency: 'PHP', shippingAddress: '',
      shippingMethod: '', taxExempt: false,
      items: [{ productId: '', description: '', quantity: 1, unitPrice: 0, discountAmount: undefined, taxAmount: undefined }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  function onSubmit(data: InvoiceCreateFormData) {
    const payload = {
      ...data,
      contactId:       data.contactId       || undefined,
      paymentTerms:    data.paymentTerms     || undefined,
      shippingAddress: data.shippingAddress  || undefined,
      shippingMethod:  data.shippingMethod   || undefined,
      items: data.items.map((item) => ({
        ...item,
        productId:   item.productId   || undefined,
        description: item.description || undefined,
      })),
    }
    createInvoice(payload, {
      onSuccess: (invoice) => {
        toast('Invoice created', { variant: 'success' })
        navigate(`/invoices/${invoice.id}`)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="rounded-xl border bg-background p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Invoice Info</h2>

        <FormRow label="Subject" required error={errors.subject?.message}>
          <Input {...register('subject')} placeholder="e.g. Invoice for Q1 supply" className={errors.subject ? 'border-destructive' : ''} />
        </FormRow>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormRow label="Account" required error={errors.accountId?.message}>
            <Controller
              name="accountId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                    if (accountResults) {
                      setCachedAccounts((prev) => [
                        ...prev,
                        ...(accountResults ?? []).filter((a) => !prev.find((c) => c.id === a.id)),
                      ])
                    }
                  }}
                  options={accountOptions}
                  placeholder="Search account..."
                  searchPlaceholder="Type account name..."
                  onSearchChange={setAccountQuery}
                  isLoading={isSearchingAccounts}
                  error={!!errors.accountId}
                />
              )}
            />
          </FormRow>

          <FormRow label="Contact (optional)">
            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <Combobox
                  value={field.value ?? ''}
                  onChange={(value) => {
                    field.onChange(value)
                    if (contactResults) {
                      setCachedContacts((prev) => [
                        ...prev,
                        ...(contactResults ?? []).filter((c) => !prev.find((x) => x.id === c.id)),
                      ])
                    }
                  }}
                  options={contactOptions}
                  placeholder="Search contact..."
                  searchPlaceholder="Type contact name..."
                  onSearchChange={setContactQuery}
                  isLoading={isSearchingContacts}
                />
              )}
            />
          </FormRow>

          <FormRow label="Invoice Date" required error={errors.invoiceDate?.message}>
            <Input id="invoiceDate" type="date" {...register('invoiceDate')} className={errors.invoiceDate ? 'border-destructive' : ''} />
          </FormRow>

          <FormRow label="Due Date" required error={errors.dueDate?.message}>
            <Input id="dueDate" type="date" {...register('dueDate')} className={errors.dueDate ? 'border-destructive' : ''} />
          </FormRow>

          <FormRow label="Payment Terms">
            <Input {...register('paymentTerms')} placeholder="e.g. Net 30" />
          </FormRow>

          <FormRow label="Currency">
            <Input {...register('currency')} placeholder="PHP" />
          </FormRow>
        </div>

        <FormRow label="Billing Address" required error={errors.billingAddress?.message}>
          <Input {...register('billingAddress')} placeholder="Street, City, Province, ZIP" className={errors.billingAddress ? 'border-destructive' : ''} />
        </FormRow>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormRow label="Shipping Address">
            <Input {...register('shippingAddress')} placeholder="Same as billing or different" />
          </FormRow>
          <FormRow label="Shipping Method">
            <Input {...register('shippingMethod')} placeholder="e.g. LBC, J&T, courier" />
          </FormRow>
        </div>

        <div className="flex items-center gap-2">
          <input id="taxExempt" type="checkbox" className="h-4 w-4 rounded border-input" {...register('taxExempt')} />
          <Label htmlFor="taxExempt" className="text-sm cursor-pointer">Tax Exempt</Label>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line Items</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              append({ productId: '', description: '', quantity: 1, unitPrice: 0, discountAmount: undefined, taxAmount: undefined })
              setProductQueries((prev) => [...prev, ''])
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Item
          </Button>
        </div>

        {errors.items?.root && (
          <p className="text-xs text-destructive">{errors.items.root.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormRow label="Product (optional)">
                  <Controller
                    name={`items.${index}.productId`}
                    control={control}
                    render={({ field: f }) => (
                      <Combobox
                        value={f.value ?? ''}
                        onChange={(value) => {
                          f.onChange(value)
                          if (productResults) {
                            setCachedProducts((prev) => [
                              ...prev,
                              ...(productResults ?? []).filter((p) => !prev.find((x) => x.id === p.id)),
                            ])
                          }
                        }}
                        options={productOptions}
                        placeholder="Search product..."
                        searchPlaceholder="Type product name..."
                        onSearchChange={(q) => {
                          setProductQueries((prev) => {
                            const updated = [...prev]
                            updated[index] = q
                            return updated
                          })
                        }}
                      />
                    )}
                  />
                </FormRow>
                <FormRow label="Description">
                  <Input {...register(`items.${index}.description`)} placeholder="Optional description" />
                </FormRow>
                <FormRow label="Quantity" required error={errors.items?.[index]?.quantity?.message}>
                  <Input type="number" min={1} {...register(`items.${index}.quantity`)} className={errors.items?.[index]?.quantity ? 'border-destructive' : ''} />
                </FormRow>
                <FormRow label="Unit Price (₱)" required error={errors.items?.[index]?.unitPrice?.message}>
                  <Input type="number" min={0} step={0.01} {...register(`items.${index}.unitPrice`)} className={errors.items?.[index]?.unitPrice ? 'border-destructive' : ''} />
                </FormRow>
                <FormRow label="Discount Amount (₱)">
                  <Input type="number" min={0} step={0.01} {...register(`items.${index}.discountAmount`)} placeholder="0.00" />
                </FormRow>
                <FormRow label="Tax Amount (₱)">
                  <Input type="number" min={0} step={0.01} {...register(`items.${index}.taxAmount`)} placeholder="0.00" />
                </FormRow>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>{isPending ? 'Creating...' : 'Create Invoice'}</Button>
        <Button type="button" variant="outline" onClick={() => navigate('/invoices')}>Cancel</Button>
      </div>
    </form>
  )
}
