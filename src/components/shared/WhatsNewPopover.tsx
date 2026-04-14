import { Sparkles, X } from 'lucide-react'
import { useWhatsNew } from '@/hooks/useWhatsNew'
import { Button } from '@/components/ui/button'

/**
 * Non-blocking "What's New" popover — bottom-right, appears once per deploy.
 * Dismissed state persisted in localStorage so it never reappears for the same version.
 * Render this inside AppShell so it sits above the page content.
 */
export function WhatsNewPopover() {
  const { entry, dismiss } = useWhatsNew()

  if (!entry) return null

  return (
    <div
      role="dialog"
      aria-label="What's new"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 w-80 rounded-xl border bg-background shadow-lg ring-1 ring-black/5 animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-foreground">{entry.title}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={dismiss}
          aria-label="Dismiss what's new"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        <ul className="space-y-1.5">
          {entry.items.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-2.5">
        <p className="text-xs text-muted-foreground">{entry.date}</p>
      </div>
    </div>
  )
}
