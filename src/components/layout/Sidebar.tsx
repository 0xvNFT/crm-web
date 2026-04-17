import { useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useSidebarContext } from '@/hooks/useSidebarContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Users,
  ShoppingCart,
  FileText,
  Target,
  Activity,
  MapPin,
  Users2,
  BarChart3,
  Settings,
  LogOut,
  X,
  TrendingUp,
  Package,
  Receipt,
  GraduationCap,
  CreditCard,
  BookUser,
  ShieldCheck,
  Megaphone,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
  roles?: string[]
}

// No roles array = visible to all authenticated users.
// roles array = visible only to those roles.
// Sidebar ordered by pharma field force workflow:
//   Prospecting (Leads) → Customer Base (Accounts, Contacts) →
//   Pipeline (Opportunities, Visits, Activities) →
//   Commercial (Quotes, Orders, Invoices)
// CSR sees: Accounts, Contacts, Orders, Invoices, Products, Materials
// READ_ONLY sees everything a non-admin user sees.
const NAV_MAIN: NavItem[] = [
  { to: '/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  // Prospecting
  { to: '/leads',         label: 'Leads',         icon: Target,      roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY'] },
  // Customer base
  { to: '/accounts',      label: 'Accounts',      icon: Building2 },
  { to: '/contacts',      label: 'Contacts',      icon: Users },
  // Pipeline management
  { to: '/opportunities', label: 'Opportunities', icon: TrendingUp,  roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY'] },
  { to: '/visits',        label: 'Visits',        icon: MapPin,      roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY'] },
  { to: '/activities',    label: 'Activities',    icon: Activity,    roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY'] },
  { to: '/campaigns',     label: 'Campaigns',     icon: Megaphone,   roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY', 'CSR'] },
  // Commercial documents
  { to: '/quotes',        label: 'Quotes',        icon: FileText,    roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY'] },
  { to: '/orders',        label: 'Orders',        icon: ShoppingCart },
  { to: '/invoices',      label: 'Invoices',      icon: Receipt },
]

const NAV_MANAGER: NavItem[] = [
  // Territories: FIELD_REP can read for route planning; ACCOUNT_MANAGER has no territory access
  { to: '/territories', label: 'Territories', icon: MapPin,        roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'READ_ONLY'] },
  // Teams: all non-CSR roles can view
  { to: '/teams',       label: 'Teams',       icon: Users2,        roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY'] },
  // Catalog: all roles including CSR can view
  { to: '/products',    label: 'Products',    icon: Package,       roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY', 'CSR'] },
  { to: '/materials',   label: 'Materials',   icon: FileText,      roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY', 'CSR'] },
  // People development: MANAGER+ only
  { to: '/coaching',    label: 'Coaching',    icon: GraduationCap, roles: ['ADMIN', 'MANAGER'] },
  // Analytics: all non-CSR roles
  { to: '/reports',              label: 'Reports',     icon: BarChart3,  roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY'] },
  { to: '/reports/kpi',          label: 'KPI Reports', icon: Target,     roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY'] },
  { to: '/reports/kpi/my-doctors', label: 'My Doctors',  icon: BookUser,   roles: ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY'] },
]

const billingEnabled = import.meta.env.VITE_BILLING_ENABLED === 'true'

const NAV_ADMIN: NavItem[] = [
  { to: '/audit',              label: 'Audit Log',        icon: ShieldCheck, roles: ['ADMIN', 'MANAGER'] },
  { to: '/settings/pipeline',  label: 'Pipeline Stages',  icon: TrendingUp,  roles: ['ADMIN', 'MANAGER'] },
  { to: '/admin',              label: 'Admin',            icon: Settings,    roles: ['ADMIN'] },
  ...(billingEnabled ? [{ to: '/billing', label: 'Billing', icon: CreditCard, roles: ['ADMIN'] } as NavItem] : []),
]

function NavGroup({
  label,
  items,
  userRoles,
  onNavigate,
}: {
  label: string
  items: NavItem[]
  userRoles: string[]
  onNavigate: () => void
}) {
  const visible = items.filter(
    (item) => !item.roles || item.roles.some((r) => userRoles.includes(r))
  )
  if (visible.length === 0) return null

  return (
    <div className="space-y-0.5">
      <p className="px-3 pb-1 pt-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25 first:pt-0">
        {label}
      </p>
      {visible.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
                : 'text-white/55 hover:bg-white/8 hover:text-white/90'
            )
          }
        >
          <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const userRoles = user?.roles ?? []

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-full flex-col bg-auth-panel">
      {/* Logo */}
      <div className="flex h-12 shrink-0 items-center gap-2.5 px-4 border-b border-white/8">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-white select-none">
          C
        </span>
        <span className="text-sm font-semibold tracking-tight text-white">
          AlphaForce CRM
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <NavGroup label="Main" items={NAV_MAIN} userRoles={userRoles} onNavigate={onNavigate} />
        <NavGroup label="Management" items={NAV_MANAGER} userRoles={userRoles} onNavigate={onNavigate} />
        <NavGroup label="Admin" items={NAV_ADMIN} userRoles={userRoles} onNavigate={onNavigate} />
      </nav>

      {/* User + Logout */}
      <div className="shrink-0 border-t border-white/8 px-2 py-2.5">
        <div className="flex items-center gap-2.5 rounded-md px-3 py-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white select-none">
            {user?.fullName ? getInitials(user.fullName) : '?'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">{user?.fullName}</p>
            <p className="truncate text-[10px] text-white/40">{user?.roles?.[0]}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { open, close } = useSidebarContext()
  const location = useLocation()

  // Close drawer on route change (mobile)
  useEffect(() => {
    close()
  }, [location.pathname, close])

  // Close drawer on Escape key
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Desktop — always visible static sidebar */}
      <aside className="hidden lg:flex lg:w-56 lg:shrink-0">
        <SidebarContent onNavigate={close} />
      </aside>

      {/* Mobile — backdrop + drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside className="absolute inset-y-0 left-0 w-72 shadow-2xl">
            <SidebarContent onNavigate={close} />
            <button
              onClick={close}
              className="absolute right-3 top-3.5 rounded p-1 text-white/40 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </aside>
        </div>
      )}
    </>
  )
}
