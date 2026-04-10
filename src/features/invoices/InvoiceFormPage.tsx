import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoiceCreateForm } from './components/InvoiceCreateForm'
import { InvoiceEditLoader } from './components/InvoiceEditForm'

export default function InvoiceFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (id) {
    return (
      <div className="space-y-0">
        <InvoiceEditLoader id={id} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')} aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">New Invoice</h1>
          <p className="text-sm text-muted-foreground">Create a manual invoice</p>
        </div>
      </div>
      <InvoiceCreateForm />
    </div>
  )
}
