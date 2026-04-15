import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { SidebarProvider } from '@/providers/SidebarProvider'
import { UpdateBanner } from '@/components/shared/UpdateBanner'
import { WhatsNewPopover } from '@/components/shared/WhatsNewPopover'

export function AppShell() {
  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <UpdateBanner />
        <WhatsNewPopover />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-y-auto bg-secondary px-6 py-5">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
