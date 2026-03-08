import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarContext } from '@/hooks/useSidebarContext'
import { useUnreadNotifications, useMarkNotificationRead } from '@/api/endpoints/notifications'
import { Bell, Menu, LogOut, User, ChevronDown, ChevronRight, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/utils/formatters'
import type { Notification } from '@/api/app-types'

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

// entityType → route prefix (for navigate-on-click)
const ENTITY_ROUTES: Record<string, string> = {
  ACCOUNT: 'accounts',
  CONTACT: 'contacts',
  LEAD: 'leads',
  ORDER: 'orders',
  QUOTE: 'quotes',
  ACTIVITY: 'activities',
  VISIT: 'visits',
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

// ─── Notification bell + dropdown ──────────────────────────────────────────────
function NotificationBell() {
  const navigate = useNavigate()
  const { data } = useUnreadNotifications()
  const { mutate: markRead } = useMarkNotificationRead()

  const notifications = data?.content ?? []
  const unreadCount = notifications.filter((n) => !n.readAt).length

  function handleClick(n: Notification) {
    if (!n.id) return
    if (!n.readAt) markRead(n.id)
    const route = n.entityType ? ENTITY_ROUTES[n.entityType] : null
    if (route && n.entityId) navigate(`/${route}/${n.entityId}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            You're all caught up
          </div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              onClick={() => handleClick(n)}
              className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer"
            >
              {/* Unread indicator */}
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  n.readAt ? 'bg-transparent' : 'bg-primary'
                }`}
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className={`text-sm leading-snug ${n.readAt ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                  {n.title ?? 'Notification'}
                </p>
                {n.body && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                )}
                {n.createdAt && (
                  <p className="text-[10px] text-muted-foreground/60">{formatDate(n.createdAt)}</p>
                )}
              </div>
              {n.readAt && (
                <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 mt-0.5" strokeWidth={2} />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── TopNav ────────────────────────────────────────────────────────────────────
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
        <NotificationBell />

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
