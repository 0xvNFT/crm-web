import type { ReactNode } from 'react'
import { useSidebar } from '@/hooks/useSidebar'
import { SidebarContext } from './SidebarContext'

export function SidebarProvider({ children }: { children: ReactNode }) {
  const sidebar = useSidebar()
  return (
    <SidebarContext.Provider value={sidebar}>
      {children}
    </SidebarContext.Provider>
  )
}
