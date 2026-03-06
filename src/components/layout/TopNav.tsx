import { useAuth } from '@/hooks/useAuth'
import { LogOut, User } from 'lucide-react'

export function TopNav() {
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
  }

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b bg-card px-4">
      <div className="flex items-center gap-2 text-sm">
        <User className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{user?.fullName}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground">{user?.role}</span>
      </div>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </header>
  )
}
