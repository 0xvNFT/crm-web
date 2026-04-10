import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/api/app-types'

/**
 * Role hierarchy: ADMIN > MANAGER > others
 *
 * ADMIN          — full access: manage users, delete records, approve anything
 * MANAGER        — approve/reject orders & quotes, edit records, run reports
 * FIELD_REP      — create visits/activities/leads; read accounts/contacts
 * ACCOUNT_MANAGER — manage pipeline for strategic accounts; no territory access
 * READ_ONLY      — view everything; zero write access (no create/edit/delete/approve)
 * CSR            — order desk only: Accounts, Contacts, Orders, Invoices, Products (read)
 *
 * All enforcement is also done server-side. This hook is purely for UI gating.
 */
export function useRole() {
  const { user } = useAuth()
  const roles: Role[] = user?.roles ?? []

  const isAdmin = roles.includes('ADMIN')
  const isManager = roles.includes('MANAGER') || isAdmin
  // isRep must check !!user — never use !isManager (that's true for logged-out users too)
  const isRep = !!user && roles.includes('FIELD_REP')
  const isAccountManager = !!user && roles.includes('ACCOUNT_MANAGER')
  // isReadOnly: hide ALL write buttons — API enforces 403 server-side too
  const isReadOnly = !!user && roles.includes('READ_ONLY')
  const isCsr = !!user && roles.includes('CSR')

  return { isAdmin, isManager, isRep, isAccountManager, isReadOnly, isCsr }
}
