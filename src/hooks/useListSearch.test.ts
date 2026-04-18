import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useListSearch } from './useListSearch'

vi.useFakeTimers()

function flushDebounce() {
  act(() => { vi.advanceTimersByTime(300) })
}

describe('useListSearch', () => {
  let goToPage: (page: number) => void

  beforeEach(() => {
    goToPage = vi.fn() as (page: number) => void
  })

  it('starts with empty query and isSearching false', () => {
    const { result } = renderHook(() => useListSearch(goToPage))
    expect(result.current.query).toBe('')
    expect(result.current.isSearching).toBe(false)
  })

  it('setQuery updates raw query and calls goToPage(0)', () => {
    const { result } = renderHook(() => useListSearch(goToPage))
    act(() => { result.current.setQuery('foo') })
    expect(result.current.query).toBe('foo')
    expect(goToPage).toHaveBeenCalledWith(0)
  })

  it('isSearching becomes true after debounce when query >= 2 chars', () => {
    const { result } = renderHook(() => useListSearch(goToPage))
    act(() => { result.current.setQuery('ab') })
    expect(result.current.isSearching).toBe(false) // before debounce fires
    flushDebounce()
    expect(result.current.isSearching).toBe(true)
  })

  it('isSearching stays false for single-char query', () => {
    const { result } = renderHook(() => useListSearch(goToPage))
    act(() => { result.current.setQuery('a') })
    flushDebounce()
    expect(result.current.isSearching).toBe(false)
  })

  describe('resolve() — not searching', () => {
    it('returns listQuery content, totalPages, totalElements', () => {
      const { result } = renderHook(() => useListSearch<{ id: string }>(goToPage))
      const listQuery = {
        data: { content: [{ id: '1' }, { id: '2' }], totalPages: 3, totalElements: 50 },
        isLoading: false, isError: false, error: null, refetch: vi.fn(),
      }
      const searchQuery = {
        data: undefined, isLoading: false, isError: false, error: null,
      }
      const resolved = result.current.resolve(listQuery, searchQuery)
      expect(resolved.data).toEqual([{ id: '1' }, { id: '2' }])
      expect(resolved.totalPages).toBe(3)
      expect(resolved.totalElements).toBe(50)
    })

    it('returns empty array when listQuery data is undefined (loading state)', () => {
      const { result } = renderHook(() => useListSearch<{ id: string }>(goToPage))
      const listQuery = {
        data: undefined, isLoading: true, isError: false, error: null, refetch: vi.fn(),
      }
      const searchQuery = {
        data: undefined, isLoading: false, isError: false, error: null,
      }
      const resolved = result.current.resolve(listQuery, searchQuery)
      expect(resolved.data).toEqual([])
      expect(resolved.totalPages).toBe(0)
    })
  })

  describe('resolve() — searching', () => {
    it('returns searchQuery data with totalPages=0', () => {
      const { result } = renderHook(() => useListSearch<{ id: string }>(goToPage))
      act(() => { result.current.setQuery('abc') })
      flushDebounce()

      const listQuery = {
        data: { content: [{ id: '1' }], totalPages: 5, totalElements: 100 },
        isLoading: false, isError: false, error: null, refetch: vi.fn(),
      }
      const searchQuery = {
        data: [{ id: 'a' }, { id: 'b' }], isLoading: false, isError: false, error: null,
      }
      const resolved = result.current.resolve(listQuery, searchQuery)
      expect(resolved.data).toEqual([{ id: 'a' }, { id: 'b' }])
      expect(resolved.totalPages).toBe(0)
      expect(resolved.totalElements).toBe(2)
    })

    it('returns empty array when searchQuery data is undefined', () => {
      const { result } = renderHook(() => useListSearch<{ id: string }>(goToPage))
      act(() => { result.current.setQuery('xyz') })
      flushDebounce()

      const listQuery = {
        data: { content: [], totalPages: 0, totalElements: 0 },
        isLoading: false, isError: false, error: null, refetch: vi.fn(),
      }
      const searchQuery = {
        data: undefined, isLoading: true, isError: false, error: null,
      }
      const resolved = result.current.resolve(listQuery, searchQuery)
      expect(resolved.data).toEqual([])
    })

    it('reflects searchQuery error state — not listQuery error', () => {
      const { result } = renderHook(() => useListSearch<{ id: string }>(goToPage))
      act(() => { result.current.setQuery('test') })
      flushDebounce()

      const listQuery = {
        data: undefined, isLoading: false, isError: false, error: null, refetch: vi.fn(),
      }
      const searchQuery = {
        data: undefined, isLoading: false, isError: true, error: new Error('search fail'),
      }
      const resolved = result.current.resolve(listQuery, searchQuery)
      expect(resolved.isError).toBe(true)
      expect(resolved.error).toBeInstanceOf(Error)
    })
  })
})
