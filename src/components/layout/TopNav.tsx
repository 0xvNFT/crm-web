import { useAuth } from '@/hooks/useAuth'
import { Bell } from 'lucide-react'

export function TopNav() {
  const { user } = useAuth()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-6">
      {/* Left — tenant name / context */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{user?.fullName}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {user?.roles[0]}
        </span>
      </div>

      {/* Right — actions */}
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
