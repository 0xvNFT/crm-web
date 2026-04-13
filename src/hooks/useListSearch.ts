import { useState } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface ListQuery<T> {
  data: { content?: T[]; totalPages?: number; totalElements?: number } | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}

interface SearchQuery<T> {
  data: T[] | undefined
  isLoading: boolean
  isError: boolean
  error: unknown
}

export interface UseListSearchResult<T> {
  /** Raw query string — bind to <SearchInput value={query} onChange={setQuery} /> */
  query: string
  /** Debounced query — pass to your search endpoint hook */
  debouncedQuery: string
  /** onChange handler — updates query state and resets page to 0 */
  setQuery: (q: string) => void
  /** True when debouncedQuery.trim().length >= 2 */
  isSearching: boolean
  isLoading: boolean
  isError: boolean
  error: unknown
  data: T[]
  totalPages: number
  totalElements: number | undefined
}

/**
 * Manages search state and merges paginated list + flat search results for list pages.
 *
 * Usage in a list page:
 *
 *   const { query, debouncedQuery, setQuery, isSearching, ...rest } =
 *     useListSearch<PharmaFoo>(goToPage)
 *
 *   const listQuery   = useFoos(page, 20, filters)
 *   const searchQuery = useFooSearch(debouncedQuery)
 *
 *   const { isLoading, isError, error, data, totalPages, totalElements } =
 *     rest.resolve(listQuery, searchQuery)
 *
 * Both endpoint hooks are called at component top-level (Rules of Hooks satisfied).
 * debouncedQuery from this hook is passed to the search endpoint hook.
 */
export function useListSearch<T>(goToPage: (page: number) => void) {
  const [query, setQueryRaw] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const isSearching = debouncedQuery.trim().length >= 2

  function setQuery(q: string) {
    setQueryRaw(q)
    goToPage(0)
  }

  function resolve(listQuery: ListQuery<T>, searchQuery: SearchQuery<T>): Pick<UseListSearchResult<T>, 'isLoading' | 'isError' | 'error' | 'data' | 'totalPages' | 'totalElements'> {
    const isLoading     = isSearching ? searchQuery.isLoading : listQuery.isLoading
    const isError       = isSearching ? searchQuery.isError   : listQuery.isError
    const error         = isSearching ? searchQuery.error     : listQuery.error
    const data: T[]     = isSearching ? (searchQuery.data ?? []) : (listQuery.data?.content ?? [])
    const totalPages    = isSearching ? 0 : (listQuery.data?.totalPages ?? 0)
    const totalElements = isSearching ? data.length : listQuery.data?.totalElements
    return { isLoading, isError, error, data, totalPages, totalElements }
  }

  return { query, debouncedQuery, setQuery, isSearching, resolve }
}
