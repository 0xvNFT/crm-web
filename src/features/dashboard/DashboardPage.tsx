import { PageHeader } from '@/components/shared/PageHeader'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.fullName ?? 'there'}`}
        description="Here's what's happening across your field force today."
      />
      <p className="text-muted-foreground text-sm">Dashboard charts coming soon.</p>
    </div>
  )
}
