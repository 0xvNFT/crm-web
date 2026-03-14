import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useCreateQuote } from '@/api/endpoints/quotes'
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
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PharmaAccount, PharmaContact } from '@/api/app-types'

export default function QuoteFormPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [accountQuery, setAccountQuery] = useState('')
  const [cachedAccounts, setCachedAccounts] = useState<PharmaAccount[]>([])
  const [contactQuery, setContactQuery] = useState('')
  const [cachedContacts, setCachedContacts] = useState<PharmaContact[]>([])

  const { data: accountResults, isLoading: isSearchingAccounts } = useAccountSearch(accountQuery)
  const { data: contactResults, isLoading: isSearchingContacts } = useContactSearch(contactQuery)

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

  const { mutate: createQuote, isPending } = useCreateQuote()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      accountId: '',
      contactId: '',
      validFrom: '',
      validUntil: '',
      items: [{ productId: '', quantity: 1, discountPercent: 0, notes: '' }],
      discountPercent: undefined,
      taxAmount: undefined,
      notes: '',
    },
  })

  const watchedAccountId = useWatch({ control, name: 'accountId' })

  function onSubmit(data: QuoteFormData) {
    // repId = logged-in user's ID (required by CreateQuoteRequest)
    const payload = {
      ...data,
      repId: user!.userId,
      contactId: data.contactId || undefined,
      notes: data.notes || undefined,
      items: data.items.map((item) => ({ ...item, discountPercent: item.discountPercent ?? 0 })),
    }
    createQuote(payload, {
      onSuccess: (quote) => {
        toast('Quote created successfully', { variant: 'success' })
        navigate(`/quotes/${quote.id}`)
      },
      onError: (err) => toast(parseApiError(err), { variant: 'destructive' }),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">New Quote</h1>
          <p className="text-sm text-muted-foreground">Create a new sales quote</p>
        </div>
      </div>

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
                  placeholder="Search contact..."
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
            {isPending ? 'Creating...' : 'Create Quote'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
