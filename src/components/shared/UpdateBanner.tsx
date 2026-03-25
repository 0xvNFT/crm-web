import { RefreshCw, X } from 'lucide-react'
import { useState } from 'react'
import { useVersionCheck } from '@/hooks/useVersionCheck'

export function UpdateBanner() {
  const updateAvailable = useVersionCheck()
  const [dismissed, setDismissed] = useState(false)

  if (!updateAvailable || dismissed) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-primary px-4 py-2.5 text-primary-foreground text-sm shrink-0">
      <div className="flex items-center gap-2">
        <RefreshCw className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        <span className="font-medium">New version available!</span>
        <span className="text-primary-foreground/80 hidden sm:inline">
          Reload to update — unsaved changes will be lost.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => window.location.reload()}
          className="rounded-md border border-primary-foreground/30 px-3 py-1 text-xs font-semibold transition-colors hover:bg-primary-foreground/10"
        >
          Reload
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="rounded p-0.5 transition-colors hover:bg-primary-foreground/10"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
