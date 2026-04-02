import { useRole } from '@/hooks/useRole'

/**
 * Returns role-scoped prefix/suffix labels for list pages that filter by ownership.
 *
 * FIELD_REP / ACCOUNT_MANAGER / CSR  → "My {noun}"   (own records only)
 * MANAGER                            → "Team {noun}" (own + direct reports)
 * ADMIN / READ_ONLY                  → "All {noun}"  (entire tenant)
 */
export function useScopedLabel(noun: string): { title: string; emptyTitle: string; emptyDescription: string } {
  const { isAdmin, isManager, isReadOnly } = useRole()

  if (isAdmin || isReadOnly) {
    return {
      title: `All ${noun}`,
      emptyTitle: `No ${noun.toLowerCase()} yet`,
      emptyDescription: `No ${noun.toLowerCase()} have been recorded yet.`,
    }
  }

  if (isManager) {
    return {
      title: `Team ${noun}`,
      emptyTitle: `No ${noun.toLowerCase()} for your team yet`,
      emptyDescription: `Records assigned to you or your team will appear here.`,
    }
  }

  // FIELD_REP, ACCOUNT_MANAGER, CSR
  return {
    title: `My ${noun}`,
    emptyTitle: `No ${noun.toLowerCase()} assigned to you yet`,
    emptyDescription: `${noun} assigned to you will appear here.`,
  }
}
