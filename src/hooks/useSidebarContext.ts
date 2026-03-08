import { useContext } from 'react'
import { SidebarContext } from '@/providers/SidebarContext'

export function useSidebarContext() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebarContext must be used within SidebarProvider')
  return ctx
}
