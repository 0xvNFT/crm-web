import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { SidebarProvider } from '@/providers/SidebarProvider'

export function AppShell() {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto bg-secondary p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
