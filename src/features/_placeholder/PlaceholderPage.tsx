import { PageHeader } from '@/components/shared/PageHeader'

interface PlaceholderPageProps {
  name: string
}

export default function PlaceholderPage({ name }: PlaceholderPageProps) {
  return (
    <div className="space-y-4">
      <PageHeader title={name} description="This page is under construction." />
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </div>
  )
}
