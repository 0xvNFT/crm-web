import { useAuth } from '@/hooks/useAuth'
import type { Role } from '@/api/app-types'

/**
 * Role hierarchy: ADMIN > MANAGER > REP
 *
 * ADMIN  — full access: manage users, delete records, approve anything
 * MANAGER — approve/reject orders & quotes, edit records, run reports
 * REP    — read-only on accounts/contacts, create visits/activities/leads
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

  return { isAdmin, isManager, isRep }
}
