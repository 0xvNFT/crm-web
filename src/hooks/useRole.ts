import { useAuth } from '@/hooks/useAuth'

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
  const roles = user?.roles ?? []

  const isAdmin = roles.includes('ADMIN')
  const isManager = roles.includes('MANAGER') || isAdmin
  const isRep = !!user && roles.includes('FIELD_REP')

  return { isAdmin, isManager, isRep }
}
