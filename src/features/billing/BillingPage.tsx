import { CreditCard, Zap, Users, Database, CheckCircle2, ArrowUpRight, ExternalLink, CalendarDays, AlertTriangle } from 'lucide-react'
import { useSubscription, useListPlans, useCreateCheckout, useCreatePortal } from '@/api/endpoints/billing'
import { useRole } from '@/hooks/useRole'
import { PageHeader } from '@/components/shared/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/useToast'
import { parseApiError } from '@/utils/errors'
import type { PlanResponse, BillingSubscription } from '@/api/app-types'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatStatus(status?: string) {
  if (!status) return 'Unknown'
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatPrice(usd?: number) {
  if (usd == null) return '—'
  return usd === 0 ? 'Free' : `$${usd.toLocaleString()}/mo`
}

function statusColor(status?: string) {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':    return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    case 'TRIALING':  return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'PAST_DUE':  return 'text-amber-600 bg-amber-50 border-amber-200'
    case 'CANCELED':
    case 'INACTIVE':  return 'text-destructive bg-destructive/5 border-destructive/20'
    default:          return 'text-muted-foreground bg-muted border-border'
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-secondary/50 px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  )
}

function SubscriptionCard({ sub }: { sub: BillingSubscription }) {
  const isPastDue  = sub.status?.toUpperCase() === 'PAST_DUE'
  const isCanceled = sub.status?.toUpperCase() === 'CANCELED' || sub.status?.toUpperCase() === 'INACTIVE'

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            Current Subscription
          </h2>
          <p className="text-xs text-muted-foreground">Your active plan and billing cycle</p>
        </div>
        <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', statusColor(sub.status))}>
          {formatStatus(sub.status)}
        </span>
      </div>

      {isPastDue && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm text-amber-700">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>Payment is past due. Please update your billing details to avoid interruption.</span>
        </div>
      )}

      {isCanceled && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>Your subscription has been canceled. Upgrade to restore access.</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatPill icon={CalendarDays} label="Period start"  value={formatDate(sub.currentPeriodStart)} />
        <StatPill icon={CalendarDays} label="Period end"    value={formatDate(sub.currentPeriodEnd)} />
        <StatPill icon={CalendarDays} label="Canceled at"   value={sub.canceledAt ? formatDate(sub.canceledAt) : 'Active'} />
        <StatPill icon={CreditCard}   label="Stripe ID"     value={sub.stripeSubscriptionId ? `…${sub.stripeSubscriptionId.slice(-8)}` : 'Not set'} />
      </div>
    </div>
  )
}

function PlanCard({
  plan,
  isCurrent,
  onUpgrade,
  isUpgrading,
}: {
  plan: PlanResponse
  isCurrent: boolean
  onUpgrade: (planId: string) => void
  isUpgrading: boolean
}) {
  const features = plan.features ?? []

  return (
    <div className={cn(
      'relative rounded-xl border border-border/60 bg-card p-5 flex flex-col gap-4 transition-shadow',
      isCurrent
        ? 'border-primary ring-1 ring-primary/30 shadow-sm'
        : 'hover:shadow-sm',
    )}>
      {isCurrent && (
        <span className="absolute -top-2.5 left-4 text-xs font-semibold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
          Current plan
        </span>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{plan.name ?? 'Unnamed plan'}</h3>
          {plan.tier && (
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full capitalize">
              {plan.tier.toLowerCase()}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground tracking-tight">
          {formatPrice(plan.priceMonthlyUsd)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          <span>{plan.maxUsers ?? '—'} users</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Database className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          <span>{plan.maxRecords?.toLocaleString() ?? '—'} records</span>
        </div>
      </div>

      {features.length > 0 && (
        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-2">
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled size="sm">
            Current plan
          </Button>
        ) : (
          <Button
            className="w-full gap-1.5"
            size="sm"
            onClick={() => plan.id && onUpgrade(plan.id)}
            disabled={isUpgrading || !plan.isActive}
          >
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
            {isUpgrading ? 'Redirecting…' : 'Upgrade'}
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { isAdmin } = useRole()
  const { data: sub, isLoading: subLoading } = useSubscription()
  const { data: plans, isLoading: plansLoading } = useListPlans()
  const checkout = useCreateCheckout()
  const portal   = useCreatePortal()

  const activePlans = (plans ?? []).filter((p) => p.isActive)

  function handleUpgrade(planId: string) {
    checkout.mutate(
      {
        planId,
        successUrl: `${window.location.origin}/billing?upgraded=true`,
        cancelUrl:  `${window.location.origin}/billing`,
      },
      {
        // eslint-disable-next-line no-restricted-syntax -- external Stripe URL, navigate() only works for internal routes
        onSuccess: (url) => { window.location.href = url },
        onError:   (err) => toast('Checkout failed', { variant: 'destructive', description: parseApiError(err) }),
      },
    )
  }

  function handlePortal() {
    portal.mutate(
      { returnUrl: `${window.location.origin}/billing` },
      {
        // eslint-disable-next-line no-restricted-syntax -- external Stripe URL, navigate() only works for internal routes
        onSuccess: (url) => { window.location.href = url },
        onError:   (err) => toast('Could not open billing portal', { variant: 'destructive', description: parseApiError(err) }),
      },
    )
  }

  const isLoading = subLoading || plansLoading

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Subscription"
        description="Manage your plan, view usage limits, and update billing details."
        actions={
          isAdmin && (
            <Button variant="outline" size="sm" className="gap-2" onClick={handlePortal} disabled={portal.isPending}>
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
              {portal.isPending ? 'Opening…' : 'Manage billing'}
            </Button>
          )
        }
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
          {/* Current subscription status */}
          {sub ? (
            <SubscriptionCard sub={sub} />
          ) : (
            <div className="rounded-xl border border-border/60 bg-card p-8 text-center space-y-2">
              <Zap className="h-8 w-8 text-muted-foreground/40 mx-auto" strokeWidth={1.5} />
              <p className="text-sm font-medium text-foreground">No active subscription</p>
              <p className="text-xs text-muted-foreground">Choose a plan below to get started.</p>
            </div>
          )}

          {/* Plan catalogue */}
          {activePlans.length > 0 && (
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Available Plans</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAdmin
                    ? 'Select a plan to upgrade. You will be redirected to complete payment.'
                    : 'Contact your admin to change your subscription plan.'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isCurrent={plan.id === sub?.planId}
                    onUpgrade={handleUpgrade}
                    isUpgrading={checkout.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {!isAdmin && (
            <p className="text-xs text-muted-foreground text-center">
              Only admins can change the subscription plan. Contact your account administrator.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
