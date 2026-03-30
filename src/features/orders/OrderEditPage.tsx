import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useOrder, useUpdateOrder } from '@/api/endpoints/orders'
import { useAccountSearch } from '@/api/endpoints/accounts'
import { orderSchema, type OrderFormData } from '@/schemas/orders'
import { LineItemsField } from './components/LineItemsField'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PharmaAccount, PharmaOrder } from '@/api/app-types'

// ─── Inner form ───────────────────────────────────────────────────────────────

interface OrderEditFormProps {
  order: PharmaOrder
}

function OrderEditForm({ order }: OrderEditFormProps) {
  const navigate = useNavigate()
  const [accountQuery, setAccountQuery] = useState('')
  const initialAccount = order.accountId && order.accountName
    ? [{ id: order.accountId, name: order.accountName } as PharmaAccount]
    : []
  const [cachedAccounts, setCachedAccounts] = useState<PharmaAccount[]>(initialAccount)

  const debouncedAccountQuery = useDebounce(accountQuery, 300)
  const { data: accountResults, isLoading: isSearchingAccounts } = useAccountSearch(debouncedAccountQuery)

  const mergedAccounts = [
    ...cachedAccounts,
    ...(accountResults ?? []).filter((a) => !cachedAccounts.find((c) => c.id === a.id)),
  ]

  const accountOptions = mergedAccounts
    .filter((a) => a.id && a.name)
    .map((a) => ({
      value: a.id!,
      label: a.name!,
      sublabel: a.accountType ?? undefined,
    }))

  const { mutate: updateOrder, isPending } = useUpdateOrder(order.id ?? '')

  const defaultItems = (order.items ?? []).map((item) => ({
    productId: item.productId ?? '',
    batchId: item.batchId ?? undefined,
    quantity: item.quantity ?? 1,
    discountPercent: item.discountPercent ?? 0,
  }))

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      accountId: order.accountId ?? '',
      items: defaultItems.length > 0
        ? defaultItems
        : [{ productId: '', batchId: undefined, quantity: 1, discountPercent: 0 }],
      discountPercent: order.discountPercent ?? undefined,
      taxAmount: order.taxAmount ?? undefined,
      deliveryDate: order.deliveryDate ? order.deliveryDate.slice(0, 16) : '',
      notes: order.notes ?? '',
    },
  })

  const watchedAccountId = useWatch({ control, name: 'accountId' })

  function onSubmit(data: OrderFormData) {
    const payload = {
      ...data,
      items: data.items.map((item) => ({ ...item, discountPercent: item.discountPercent ?? 0 })),
    }
    updateOrder(payload, {
      onSuccess: () => {
        toast('Order updated successfully', { variant: 'success' })
        navigate(`/orders/${order.id}`)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* Order Info */}
      <div className="rounded-xl border bg-background p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order Info</h2>

        <div className="space-y-1">
          <Label>Account *</Label>
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
          {errors.accountId && (
            <p className="text-xs text-destructive">{errors.accountId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="discountPercent">Order Discount %</Label>
            <Input
              id="discountPercent"
              type="number"
              min={0}
              max={100}
              step={0.01}
              placeholder="0"
              {...register('discountPercent')}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="taxAmount">Tax Amount (₱)</Label>
            <Input
              id="taxAmount"
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              {...register('taxAmount')}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="deliveryDate">Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="datetime-local"
              {...register('deliveryDate')}
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Order notes..." rows={3} {...register('notes')} />
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border bg-background p-5">
        <LineItemsField control={control} errors={errors} accountId={watchedAccountId ?? ''} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ─── Outer wrapper ────────────────────────────────────────────────────────────

const EDITABLE_STATUSES = ['draft', 'pending']

export default function OrderEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: order, isLoading, isError } = useOrder(id ?? '')

  if (isLoading) return <LoadingSpinner />
  if (isError || !order) return <ErrorMessage message="Order not found." />

  if (!EDITABLE_STATUSES.includes(order.status ?? '')) {
    return (
      <ErrorMessage message="This order cannot be edited because it has already been submitted or approved." />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit Order {order.orderNumber}
          </h1>
          <p className="text-sm text-muted-foreground">Update order details and line items</p>
        </div>
      </div>

      <OrderEditForm order={order} />
    </div>
  )
}
