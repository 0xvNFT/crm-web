import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthLayoutProps {
  children: ReactNode
}

const HIGHLIGHTS = [
  'Full territory and account visibility',
  'Lead-to-order pipeline in one place',
  'Field visit logs with coaching and compliance',
  'Built for reps, managers, and admins',
]

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* LEFT — brand panel */}
      <aside className="hidden lg:flex lg:w-[44%] xl:w-[40%] flex-col justify-between bg-auth-panel px-12 py-10">
        {/* Logo */}
        <Link to="/login" className="flex items-center gap-2.5 w-fit">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white font-bold text-sm select-none">
            AF
          </span>
          <span className="text-auth-panel-foreground font-semibold text-base tracking-tight">
            AlphaForce CRM
          </span>
        </Link>

        {/* Center copy */}
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-auth-panel-subtle">
              AlphaForce CRM
            </p>
            <h1 className="text-4xl font-bold text-auth-panel-foreground leading-tight tracking-tight">
              Your field force,<br />fully in control.
            </h1>
            <p className="text-auth-panel-subtle text-sm leading-relaxed max-w-xs">
              From territory planning to order fulfillment - one platform for your entire pharma field operation.
            </p>
          </div>

          <ul className="space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-auth-panel-subtle">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-auth-panel-subtle/60">
          &copy; {new Date().getFullYear()} AlphaForce CRM. All rights reserved.
        </p>
      </aside>

      {/* RIGHT — form area */}
      <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        {/* Mobile-only logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground font-bold text-xs select-none">
            AF
          </span>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            AlphaForce CRM
          </span>
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </main>
    </div>
  )
}
