import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarContext } from '@/providers/SidebarProvider'
import { Bell, Menu, LogOut, User, ChevronDown, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Route segment → human-readable label
const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  accounts: 'Accounts',
  contacts: 'Contacts',
  leads: 'Leads',
  orders: 'Orders',
  quotes: 'Quotes',
  activities: 'Activities',
  visits: 'Visits',
  territories: 'Territories',
  teams: 'Teams',
  reports: 'Reports',
  admin: 'Admin',
  profile: 'Profile',
  new: 'New',
}

function isUuid(s: string) {
  return /^[0-9a-f-]{36}$/i.test(s)
}

function useBreadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  return segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/')
    const label = isUuid(seg)
      ? 'Detail'
      : (ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1))
    return { label, path, isLast: i === segments.length - 1 }
  })
}

export function TopNav() {
  const { user, logout } = useAuth()
  const { toggle } = useSidebarContext()
  const navigate = useNavigate()
  const breadcrumbs = useBreadcrumbs()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 lg:px-6">
      {/* Left — hamburger (mobile) + breadcrumb (desktop) */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>

        {/* Breadcrumb — desktop only */}
        <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.path} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" strokeWidth={2} />}
              {crumb.isLast ? (
                <span className="font-medium text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <button
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-accent">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {user?.fullName?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <span className="hidden font-medium text-foreground sm:block">{user?.fullName}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium text-foreground">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {user?.roles[0]}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
