import { useAuth } from '@/hooks/useAuth'
import { useSidebarContext } from '@/providers/SidebarProvider'
import { Bell, Menu } from 'lucide-react'

export function TopNav() {
  const { user } = useAuth()
  const { toggle } = useSidebarContext()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{user?.fullName}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {user?.roles[0]}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  )
}
