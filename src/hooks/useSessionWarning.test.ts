import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessionWarning, WARN_BEFORE_MS } from './useSessionWarning'

const NOW = 1_000_000_000_000

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useSessionWarning', () => {
  it('show: false when expiresAt is undefined', () => {
    const { result } = renderHook(() => useSessionWarning(undefined))
    expect(result.current.show).toBe(false)
    expect(result.current.secondsLeft).toBe(0)
  })

  it('show: false when expiry is well outside the warning window', () => {
    const expiresAt = NOW + WARN_BEFORE_MS + 60_000  // 1 min past warn threshold
    const { result } = renderHook(() => useSessionWarning(expiresAt))
    expect(result.current.show).toBe(false)
  })

  it('show: true with correct secondsLeft when inside warning window', () => {
    const expiresAt = NOW + 90_000  // 90 seconds left
    const { result } = renderHook(() => useSessionWarning(expiresAt))
    expect(result.current.show).toBe(true)
    expect(result.current.secondsLeft).toBe(90)
  })

  it('show: true with secondsLeft: 0 when already expired', () => {
    const expiresAt = NOW - 5_000  // expired 5s ago
    const { result } = renderHook(() => useSessionWarning(expiresAt))
    expect(result.current.show).toBe(true)
    expect(result.current.secondsLeft).toBe(0)
  })

  it('transitions show: false → true as time passes into warning window', () => {
    // 3 min left — outside window initially
    const expiresAt = NOW + 3 * 60_000
    const { result } = renderHook(() => useSessionWarning(expiresAt))
    expect(result.current.show).toBe(false)

    // Advance past the warn threshold (need > 1 min to pass for 2-min window)
    act(() => {
      vi.advanceTimersByTime(61_000)
    })

    expect(result.current.show).toBe(true)
    expect(result.current.secondsLeft).toBe(119)  // ~2 min - 1s tick
  })

  it('countdown decrements each second', () => {
    const expiresAt = NOW + 5_000  // 5 seconds left
    const { result } = renderHook(() => useSessionWarning(expiresAt))
    expect(result.current.secondsLeft).toBe(5)

    act(() => { vi.advanceTimersByTime(1_000) })
    expect(result.current.secondsLeft).toBe(4)

    act(() => { vi.advanceTimersByTime(1_000) })
    expect(result.current.secondsLeft).toBe(3)
  })

  it('cleans up interval on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval')
    const expiresAt = NOW + 90_000
    const { unmount } = renderHook(() => useSessionWarning(expiresAt))
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })
})
