import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, User, TrendingUp, ExternalLink } from 'lucide-react'
import { useConvertLead } from '@/api/endpoints/leads'
import { useAccountSearch } from '@/api/endpoints/accounts'
import { useContactSearch } from '@/api/endpoints/contacts'
import { useDebounce } from '@/hooks/useDebounce'
import { Combobox, type ComboboxOption } from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { LeadConversionResult } from '@/api/app-types'

interface LeadConvertDialogProps {
  open: boolean
  leadId: string
  // Source fields from the lead — used to pre-fill pickers
  sourceAccountId?: string
  sourceAccountName?: string
  sourceContactId?: string
  sourceContactName?: string
  onClose: () => void
}

export function LeadConvertDialog({
  open,
  leadId,
  sourceAccountId,
  sourceAccountName,
  sourceContactId,
  sourceContactName,
  onClose,
}: LeadConvertDialogProps) {
  const navigate = useNavigate()
  const { mutate: convertLead, isPending } = useConvertLead()

  const [result, setResult] = useState<LeadConversionResult | null>(null)

  // Account picker — pre-seeded from source account if present
  const [accountId, setAccountId] = useState<string>(sourceAccountId ?? '')
  const [accountQuery, setAccountQuery] = useState('')
  const debouncedAccountQuery = useDebounce(accountQuery, 300)
  const { data: accountResults, isLoading: isSearchingAccounts } = useAccountSearch(debouncedAccountQuery)
  const accountOptions: ComboboxOption[] = (accountResults ?? []).map((a) => ({
    value: a.id!,
    label: a.name ?? '',
  }))
  const selectedAccountOption: ComboboxOption | undefined = sourceAccountId
    ? { value: sourceAccountId, label: sourceAccountName ?? '' }
    : undefined

  // Contact picker — pre-seeded from source contact if present
  const [contactId, setContactId] = useState<string>(sourceContactId ?? '')
  const [contactQuery, setContactQuery] = useState('')
  const debouncedContactQuery = useDebounce(contactQuery, 300)
  const { data: contactResults, isLoading: isSearchingContacts } = useContactSearch(debouncedContactQuery)
  const contactOptions: ComboboxOption[] = (contactResults ?? []).map((c) => ({
    value: c.id!,
    label: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
  }))
  const selectedContactOption: ComboboxOption | undefined = sourceContactId
    ? { value: sourceContactId, label: sourceContactName ?? '' }
    : undefined

  function handleConvert() {
    convertLead(
      {
        id: leadId,
        data: {
          accountId: accountId || undefined,
          contactId: contactId || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setResult(data)
        },
        onError: (err) => {
          toast(parseApiError(err), { variant: 'destructive' })
        },
      }
    )
  }

  function handleClose() {
    setResult(null)
    setAccountId(sourceAccountId ?? '')
    setContactId(sourceContactId ?? '')
    setAccountQuery('')
    setContactQuery('')
    onClose()
  }

  // ─── Success state: show links to created entities ─────────────────────────
  if (result) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lead Converted</DialogTitle>
            <DialogDescription>
              The lead has been converted. The following records were created or linked:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {result.account && (
              <button
                className="w-full flex items-center gap-3 rounded-lg border bg-background p-3 text-left hover:bg-accent transition-colors"
                onClick={() => { navigate(`/accounts/${result.account!.id}`); handleClose() }}
              >
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Account</p>
                  <p className="text-sm font-medium truncate">{result.account.name ?? 'View Account'}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
              </button>
            )}

            {result.contact && (
              <button
                className="w-full flex items-center gap-3 rounded-lg border bg-background p-3 text-left hover:bg-accent transition-colors"
                onClick={() => { navigate(`/contacts/${result.contact!.id}`); handleClose() }}
              >
                <User className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium truncate">
                    {`${result.contact.firstName ?? ''} ${result.contact.lastName ?? ''}`.trim() || 'View Contact'}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
              </button>
            )}

            {result.opportunity && (
              <button
                className="w-full flex items-center gap-3 rounded-lg border bg-background p-3 text-left hover:bg-accent transition-colors"
                onClick={() => { navigate(`/opportunities/${result.opportunity!.id}`); handleClose() }}
              >
                <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Opportunity</p>
                  <p className="text-sm font-medium truncate">{result.opportunity.topic ?? 'View Opportunity'}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.5} />
              </button>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // ─── Convert form ──────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convert Lead?</DialogTitle>
          <DialogDescription>
            This will create an Account, Contact, and Opportunity from this lead.
            You can override the account or contact below, or leave blank to auto-create from lead data.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Account
              {sourceAccountId && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">Source account pre-filled — you can change it</span>
              )}
            </p>
            <Combobox
              value={accountId}
              onChange={setAccountId}
              options={accountOptions}
              selectedOption={selectedAccountOption}
              placeholder={sourceAccountId ? (sourceAccountName ?? 'Source account') : 'Search accounts…'}
              searchPlaceholder="Type account name…"
              onSearchChange={setAccountQuery}
              isLoading={isSearchingAccounts}
            />
            {!sourceAccountId && (
              <p className="text-xs text-muted-foreground">Leave blank to auto-create from lead data.</p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Contact
              {sourceContactId && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">Source contact pre-filled — you can change it</span>
              )}
            </p>
            <Combobox
              value={contactId}
              onChange={setContactId}
              options={contactOptions}
              selectedOption={selectedContactOption}
              placeholder={sourceContactId ? (sourceContactName ?? 'Source contact') : 'Search contacts…'}
              searchPlaceholder="Type name…"
              onSearchChange={setContactQuery}
              isLoading={isSearchingContacts}
            />
            {!sourceContactId && (
              <p className="text-xs text-muted-foreground">Leave blank to auto-create from lead's name.</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleConvert} disabled={isPending}>
            {isPending ? 'Converting…' : 'Convert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
