import { useSyncExternalStore, useCallback } from 'react'

export type ToastVariant = 'default' | 'success' | 'destructive'

export interface ToastData {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

// Module-level state — shared across the entire app without prop drilling
let listeners: Array<() => void> = []
let toasts: ToastData[] = []

function subscribe(listener: () => void) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

function getSnapshot(): ToastData[] {
  return toasts
}

function dispatch(next: ToastData[]) {
  toasts = next
  listeners.forEach((l) => l())
}

export function toast(title: string, options?: { description?: string; variant?: ToastVariant }) {
  const id = Math.random().toString(36).slice(2)
  // Capture current snapshot at call time — avoids stale closure in setTimeout
  dispatch([...toasts, { id, title, description: options?.description, variant: options?.variant ?? 'default' }])
  setTimeout(() => {
    // Re-read toasts at dismiss time to avoid stale state
    dispatch(toasts.filter((t) => t.id !== id))
  }, 4000)
}

export function useToast() {
  // useSyncExternalStore: React 18+ standard for external store subscriptions.
  // Handles cleanup automatically — no listener leaks on remount.
  const state = useSyncExternalStore(subscribe, getSnapshot)

  const dismiss = useCallback((id: string) => {
    dispatch(toasts.filter((t) => t.id !== id))
  }, [])

  return { toasts: state, dismiss }
}
