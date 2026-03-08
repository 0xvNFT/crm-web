import { createContext } from 'react'

export interface SidebarContextValue {
  open: boolean
  toggle: () => void
  close: () => void
}

export const SidebarContext = createContext<SidebarContextValue | null>(null)
