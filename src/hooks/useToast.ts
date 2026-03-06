import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'success' | 'destructive'

export interface ToastData {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

// Module-level state so any component can trigger toasts without prop drilling
let listeners: Array<(toasts: ToastData[]) => void> = []
let toasts: ToastData[] = []

function dispatch(next: ToastData[]) {
  toasts = next
  listeners.forEach((l) => l(toasts))
}

export function toast(title: string, options?: { description?: string; variant?: ToastVariant }) {
  const id = Math.random().toString(36).slice(2)
  dispatch([...toasts, { id, title, description: options?.description, variant: options?.variant ?? 'default' }])
  // Auto-dismiss after 4s
  setTimeout(() => {
    dispatch(toasts.filter((t) => t.id !== id))
  }, 4000)
}

export function useToast() {
  const [state, setState] = useState<ToastData[]>(toasts)

  const subscribe = useCallback((listener: (t: ToastData[]) => void) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  useState(() => {
    const unsubscribe = subscribe(setState)
    return unsubscribe
  })

  const dismiss = useCallback((id: string) => {
    dispatch(toasts.filter((t) => t.id !== id))
  }, [])

  return { toasts: state, dismiss }
}
