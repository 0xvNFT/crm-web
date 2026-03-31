import { useSearchParams } from 'react-router-dom'
import { useCallback } from 'react'

/**
 * Manages list page state (pagination + filters) in URL search params.
 * Back button and deep links work correctly — position and filters are preserved.
 *
 * URL format: ?page=2&status=active&accountType=hospital
 */
export function useListParams(filterKeys: string[]) {
  const [params, setParams] = useSearchParams()

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
      for (const key of filterKeys) next.delete(key)
      next.set('page', '0')
      return next
    })
  }, [filterKeys, setParams])

  return { page, filters, goToPage, setFilter, clearFilters }
}
