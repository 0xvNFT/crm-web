import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useQuote, useUpdateQuote } from '@/api/endpoints/quotes'
import { useAccountSearch } from '@/api/endpoints/accounts'
import { useContactSearch } from '@/api/endpoints/contacts'
import { useAuth } from '@/hooks/useAuth'
import { quoteSchema, type QuoteFormData } from '@/schemas/quotes'
import { QuoteLineItemsField } from './components/QuoteLineItemsField'
import { Combobox } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PharmaAccount, PharmaContact } from '@/api/app-types'

// ─── Inner form (rendered after quote data loads) ─────────────────────────────

interface QuoteEditFormProps {
  quoteId: string
  defaultValues: QuoteFormData
  initialAccountName: string
  initialContactName: string
}

function QuoteEditForm({ quoteId, defaultValues, initialAccountName, initialContactName }: QuoteEditFormProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [accountQuery, setAccountQuery] = useState('')
  const [cachedAccounts, setCachedAccounts] = useState<PharmaAccount[]>([])
  const [contactQuery, setContactQuery] = useState('')
  const [cachedContacts, setCachedContacts] = useState<PharmaContact[]>([])

  const debouncedAccountQuery = useDebounce(accountQuery, 300)
  const debouncedContactQuery = useDebounce(contactQuery, 300)
  const { data: accountResults, isLoading: isSearchingAccounts } = useAccountSearch(debouncedAccountQuery)
  const { data: contactResults, isLoading: isSearchingContacts } = useContactSearch(debouncedContactQuery)

  const mergedAccounts = [
    ...cachedAccounts,
    ...(accountResults ?? []).filter((a) => !cachedAccounts.find((c) => c.id === a.id)),
  ]
  const mergedContacts = [
    ...cachedContacts,
    ...(contactResults ?? []).filter((c) => !cachedContacts.find((x) => x.id === c.id)),
  ]

  const accountOptions = mergedAccounts
    .filter((a) => a.id && a.name)
    .map((a) => ({ value: a.id!, label: a.name!, sublabel: a.accountType ?? undefined }))

  const contactOptions = mergedContacts
    .filter((c) => c.id)
    .map((c) => ({
      value: c.id!,
      label: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
      sublabel: c.contactType ?? undefined,
    }))

  const { mutate: updateQuote, isPending } = useUpdateQuote(quoteId)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues,
  })

  const watchedAccountId = useWatch({ control, name: 'accountId' })

  function onSubmit(data: QuoteFormData) {
    const payload = {
      ...data,
      repId: user!.userId,
      contactId: data.contactId || undefined,
      notes: data.notes || undefined,
      items: data.items.map((item) => ({ ...item, discountPercent: item.discountPercent ?? 0 })),
    }
    updateQuote(payload, {
      onSuccess: () => {
        toast('Quote updated', { variant: 'success' })
        navigate(`/quotes/${quoteId}`)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {/* Quote Info */}
      <div className="rounded-xl border bg-background p-5 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quote Info</h2>

        {/* Account */}
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
                placeholder={initialAccountName || 'Search account...'}
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

        {/* Contact (optional) */}
        <div className="space-y-1">
          <Label>Contact (optional)</Label>
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
                placeholder={initialContactName || 'Search contact...'}
                searchPlaceholder="Type contact name..."
                onSearchChange={setContactQuery}
                isLoading={isSearchingContacts}
              />
            )}
          />
        </div>

        {/* Validity dates */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="validFrom">Valid From *</Label>
            <Input
              id="validFrom"
              type="date"
              {...register('validFrom')}
              className={errors.validFrom ? 'border-destructive' : ''}
            />
            {errors.validFrom && (
              <p className="text-xs text-destructive">{errors.validFrom.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="validUntil">Valid Until *</Label>
            <Input
              id="validUntil"
              type="date"
              {...register('validUntil')}
              className={errors.validUntil ? 'border-destructive' : ''}
            />
            {errors.validUntil && (
              <p className="text-xs text-destructive">{errors.validUntil.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="discountPercent">Quote Discount %</Label>
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
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Quote notes..." rows={3} {...register('notes')} />
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border bg-background p-5">
        <QuoteLineItemsField
          control={control}
          errors={errors}
          accountId={watchedAccountId ?? ''}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(`/quotes/${quoteId}`)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ─── Outer loader ──────────────────────────────────────────────────────────────

export default function QuoteEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: quote, isLoading, isError } = useQuote(id ?? '')

  // Gate: only draft quotes are editable
  useEffect(() => {
    if (quote && quote.status !== 'draft') {
      toast('Only draft quotes can be edited', { variant: 'destructive' })
      navigate(`/quotes/${id}`, { replace: true })
    }
  }, [quote, id, navigate])

  if (isLoading) return <LoadingSpinner />
  if (isError || !quote) return <ErrorMessage message="Quote not found." />

  const defaultValues: QuoteFormData = {
    accountId: quote.accountId ?? '',
    contactId: quote.contactId ?? '',
    validFrom: quote.validFrom ?? '',
    validUntil: quote.validUntil ?? '',
    discountPercent: quote.discountPercent ?? undefined,
    taxAmount: quote.taxAmount ?? undefined,
    notes: quote.notes ?? '',
    items: (quote.items ?? []).map((item) => ({
      productId: item.productId ?? '',
      quantity: item.quantity ?? 1,
      discountPercent: item.discountPercent ?? 0,
      notes: item.notes ?? '',
    })),
  }

  const initialAccountName = quote.accountName ?? ''
  const initialContactName = quote.contactName ?? ''

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/quotes/${id}`)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Quote</h1>
          <p className="text-sm text-muted-foreground">{quote.quoteNumber}</p>
        </div>
      </div>

      <QuoteEditForm
        quoteId={id!}
        defaultValues={defaultValues}
        initialAccountName={initialAccountName}
        initialContactName={initialContactName}
      />
    </div>
  )
}
