import { useSearchParams } from 'react-router-dom'
import { useCallback, useRef } from 'react'

/**
 * Manages list page state (pagination + filters) in URL search params.
 * Back button and deep links work correctly — position and filters are preserved.
 *
 * URL format: ?page=2&status=active&accountType=hospital
 *
 * IMPORTANT: Pass filterKeys as a module-level constant array, not an inline literal.
 * The ref stabilization below guards against inline arrays, but module-level is cleaner.
 */
export function useListParams(filterKeys: string[]) {
  const [params, setParams] = useSearchParams()

  // Stabilize filterKeys with a ref so clearFilters doesn't get a new reference
  // when callers pass an inline array literal (which creates a new array each render).
  const filterKeysRef = useRef(filterKeys)
  filterKeysRef.current = filterKeys // eslint-disable-line react-hooks/refs -- writing to ref during render is intentional (latest-value ref pattern)

  const page = Math.max(0, Number(params.get('page') ?? '0'))

  const filters: Record<string, string> = {}
  for (const key of filterKeys) {
    const val = params.get(key)
    if (val) filters[key] = val
  }

  const goToPage = useCallback(
    (p: number) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', String(p))
        return next
      })
    },
    [setParams]
  )

  const setFilter = useCallback(
    (key: string, value: string) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
        next.set('page', '0') // reset page on filter change
        return next
      })
    },
    [setParams]
  )

  const clearFilters = useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      // Read from ref — stable reference regardless of whether caller used inline array
      for (const key of filterKeysRef.current) next.delete(key)
      next.set('page', '0')
      return next
    })
  }, [setParams]) // filterKeysRef is stable — not needed in deps

  return { page, filters, goToPage, setFilter, clearFilters }
}
