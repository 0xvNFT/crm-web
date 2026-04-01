import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, User, TrendingUp, ExternalLink } from 'lucide-react'
import { useConvertLead } from '@/api/endpoints/leads'
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
  onClose: () => void
}

export function LeadConvertDialog({ open, leadId, onClose }: LeadConvertDialogProps) {
  const navigate = useNavigate()
  const { mutate: convertLead, isPending } = useConvertLead()

  const [result, setResult] = useState<LeadConversionResult | null>(null)
  const [contactId, setContactId] = useState<string>('')
  const [contactQuery, setContactQuery] = useState('')
  const debouncedContactQuery = useDebounce(contactQuery, 300)

  const { data: contactResults, isLoading: isSearchingContacts } = useContactSearch(debouncedContactQuery)
  const contactOptions: ComboboxOption[] = (contactResults ?? []).map((c) => ({
    value: c.id!,
    label: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
  }))

  function handleConvert() {
    convertLead(
      { id: leadId, data: { contactId: contactId || undefined } },
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
    setContactId('')
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
            This will create an Account and Opportunity from this lead. A Contact will be
            auto-created from the lead's name, or you can link an existing contact below.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-2">
          <p className="text-sm font-medium">Link existing contact (optional)</p>
          <Combobox
            value={contactId}
            onChange={setContactId}
            options={contactOptions}
            placeholder="Search contacts…"
            searchPlaceholder="Type name…"
            onSearchChange={setContactQuery}
            isLoading={isSearchingContacts}
          />
          <p className="text-xs text-muted-foreground">
            Leave blank to auto-create a new contact from the lead's name.
          </p>
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
