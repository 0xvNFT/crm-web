# Field Force CRM — Web

Frontend for the Pharma Field Force Management CRM. Each company gets their own isolated workspace — reps, managers, and admins log in here daily to manage contacts, accounts, visits, leads, pipeline, orders, and more.

**Stack:** React 19 · Vite 7 · TypeScript · Tailwind CSS v4 · React Query v5 · React Router v7 · Axios · Zod v4 · React Hook Form · shadcn/ui

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| Git | any | `git --version` |

---

## Setup

```bash
git clone <repo-url>
cd crm-web
npm install
cp .env.example .env.development
npm run dev
```

Open `http://localhost:5173` — the login page should load.

---

## Environment

Env files are **not committed**. Copy `.env.example` to get started.

| File | Used when | Notes |
|---|---|---|
| `.env.development` | `npm run dev` | Create from `.env.example` |
| `.env.production` | `npm run build` | Set by lead dev / CI |

**Never hardcode the API URL.** Always use `import.meta.env.VITE_API_BASE_URL`.

### Feature flags

Some features are toggled per deployment via environment variables:

```env
VITE_REGISTRATION_ENABLED=true   # self-service company registration
VITE_BILLING_ENABLED=true        # billing and plan management
```

`.env.development` always has both set to `true`. `.env.production` is set per deployment target.

---

## Scripts

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run check        # typecheck + lint together
npm run preview      # Preview the production build locally
npm run gen:types    # Regenerate API types from live Swagger spec (requires local backend)
```

**Run `npm run check` before every PR.** Fix all errors — do not ignore them.

---

## Project Structure

```
src/
├── api/
│   ├── client.ts          ← Axios instance
│   ├── types.ts           ← Auto-generated from Swagger — never edit manually
│   ├── app-types.ts       ← Type aliases — import from here, not types.ts
│   └── endpoints/         ← One file per resource
├── components/
│   ├── ui/                ← Atoms: Button, Input, Select, DateInput, Combobox, …
│   ├── layout/            ← AppShell, Sidebar, TopNav
│   └── shared/            ← DataTable, Pagination, StatusBadge, FormRow, ConfirmDialog, …
├── features/              ← One folder per domain feature
│   ├── auth/              ← Pre-built — do not modify
│   └── accounts/          ← Reference implementation
├── hooks/                 ← useAuth, useRole, useListParams, useDebounce, useConfigOptions, …
├── providers/
├── routes/
├── schemas/               ← Zod schemas — one file per feature
└── utils/
    ├── formatters.ts
    └── errors.ts
```

---

## Key Rules

### TypeScript
- No `any` — use `unknown` + type narrowing
- No `as SomeType` without a `// Why:` comment
- Import types from `@/api/app-types` — never from `@/api/types` directly

### Components
- Functional components only. One component per file.
- Pages: `export default function FooPage()`. Shared components: named exports only.
- Tailwind classes only — no inline `style={{}}`, no CSS modules

### Forms
- React Hook Form + Zod always together
- Schema in `src/schemas/<feature>.ts`, never inline in a component
- `<Controller>` for Select and Combobox — never `register()`
- `<DateInput>` for date fields, `<CheckboxField>` for boolean fields — never raw `<input>`

### Data Fetching
- React Query for all server state — no `useEffect` + `useState` for API calls
- `placeholderData: (prev) => prev` on every paginated/search query
- Always handle loading and error states

### Config-driven Dropdowns
- Never hardcode enum values in dropdowns
- Use `useConfigOptions('entity.field')` — values come from `GET /api/pharma/config`

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| `keepPreviousData: true` | `placeholderData: (prev) => prev` |
| `data.content` without `?.` | `data?.content ?? []` |
| Relative imports (`../../api/client`) | `@/api/client` |
| Importing from `@/api/types` | Import from `@/api/app-types` |
| `<input type="date">` | `<DateInput>` from `@/components/ui/date-input` |
| `<input type="checkbox">` | `<CheckboxField>` from `@/components/shared/CheckboxField` |
| `history.back()` | `navigate(-1)` |
| `window.location.href = '/path'` | `navigate('/path')` |
| `user?.roles.includes('MANAGER')` | `const { isManager } = useRole()` |
| Hardcoded dropdown options | `useConfigOptions('entity.field')` |
| Named export on a page | `export default function MyPage()` |

---

## Shared Components

### `DataTable<T>`

```typescript
import { DataTable, type Column } from '@/components/shared/DataTable'

const columns: Column<MyType>[] = [
  { header: 'Name', accessor: (row) => row.name ?? '—' },
  { header: 'Status', accessor: (row) => <StatusBadge status={row.status ?? 'unknown'} /> },
]

<DataTable columns={columns} data={data} onRowClick={(row) => navigate(`/entity/${row.id}`)} />
```

### `Pagination`

```typescript
<Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
```

### `StatusBadge`

```typescript
// Pass the raw backend value — StatusBadge normalizes casing internally
<StatusBadge status={row.status ?? 'unknown'} />
```

### `useRole`

```typescript
import { useRole } from '@/hooks/useRole'

const { isAdmin, isManager, isRep } = useRole()
// isManager = MANAGER or ADMIN (additive). Never use user?.roles.includes() inline.
```

### `formatDate` / `formatCurrency`

```typescript
import { formatDate, formatCurrency } from '@/utils/formatters'

formatDate('2026-03-06T10:00:00Z')   // → "Mar 6, 2026"
formatCurrency(1500)                  // → "₱1,500.00"
```

---

## Auth Routes

| Route | Page | Notes |
|---|---|---|
| `/login` | Login | Email + password |
| `/forgot-password` | ForgotPassword | Sends reset link |
| `/reset-password?token=xxx` | ResetPassword | Sets new password via email link |
| `/verify-email?token=xxx` | VerifyEmail | Activated via email link |
| `/register` | Register | Company registration — availability depends on deployment |

---

---

## Intern Guide

### Branch Strategy

```
main              ← production-ready code only
  └── dev-intern  ← your base branch
        └── feature/contacts
        └── feature/leads
```

Never commit directly to `dev-intern`. Branch off it, build your feature, then open a PR back. The lead dev reviews before anything merges.

### Starting a Feature

```bash
git checkout dev-intern
git pull origin dev-intern
git checkout -b feature/contacts
```

Branch naming: `feature/<name>` — lowercase, hyphenated.

### Committing

```bash
git add src/api/endpoints/contacts.ts
git add src/features/contacts/ContactListPage.tsx
git commit -m "feat(contacts): add useContacts hook and ContactListPage"
```

**Commit message format:** `type(scope): short description`

| Type | When to use |
|---|---|
| `feat` | New component, hook, or page |
| `fix` | Bug fix |
| `refactor` | Restructuring without behavior change |
| `chore` | Config, deps, cleanup |

### Before Opening a PR

```bash
npm run check   # must pass
npm run build   # must pass
```

Then push and open a PR targeting `dev-intern` — never `main`.

### Keeping Your Branch Up to Date

```bash
git fetch origin
git rebase origin/dev-intern
```

Never `git merge dev-intern` — rebase keeps history clean.

### What NOT to Do

- Do not commit to `dev-intern` or `main` directly
- Do not force push — ever
- Do not open PRs against `main`
- Do not commit `.env` files

### Files You Must NOT Touch

Talk to the lead dev before changing any of these:

- `src/api/client.ts`, `src/api/types.ts`, `src/api/app-types.ts`
- `src/features/auth/`
- `src/providers/`, `src/routes/`, `src/components/layout/`
- `src/index.css`, `vite.config.ts`, `tsconfig.app.json`, `package.json`, `eslint.config.js`

### Building a Feature

**Step 1 — Create the endpoint hook** (`src/api/endpoints/contacts.ts`):

```typescript
import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type { PharmaContact, PagePharmaContact } from '@/api/app-types'

export function useContacts(page = 0, size = 20, filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: ['contacts', 'list', { page, size, ...filters }],
    queryFn: () =>
      client
        .get<PagePharmaContact>('/api/pharma/contacts', { params: { page, size, sort: 'createdAt,desc', ...filters } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}

export function useContactSearch(q: string) {
  return useQuery({
    queryKey: ['contacts', 'search', q],
    queryFn: ({ signal }) =>
      client.get<PharmaContact[]>('/api/pharma/contacts/search', { params: { q }, signal }).then((r) => r.data),
    enabled: q.trim().length >= 2,
    placeholderData: (prev) => prev,
  })
}
```

**Step 2 — Create the list page** (`src/features/contacts/ContactListPage.tsx`):

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContacts, useContactSearch } from '@/api/endpoints/contacts'
import { useListParams } from '@/hooks/useListParams'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { ListPageSkeleton } from '@/components/shared/ListPageSkeleton'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/ui/search-input'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/utils/formatters'
import type { PharmaContact } from '@/api/app-types'

const columns: Column<PharmaContact>[] = [
  { header: 'Name',    accessor: (row) => row.fullName ?? '—' },
  { header: 'Email',   accessor: (row) => row.email ?? '—' },
  { header: 'Status',  accessor: (row) => <StatusBadge status={row.status ?? 'unknown'} /> },
  { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
]

export default function ContactListPage() {
  const navigate = useNavigate()
  const { page, filters, goToPage } = useListParams([])
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const isSearching  = debouncedQuery.trim().length >= 2
  const listQuery    = useContacts(page, 20, filters)
  const searchQuery  = useContactSearch(debouncedQuery)

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading
  const isError   = isSearching ? searchQuery.isError   : listQuery.isError
  const data: PharmaContact[] = isSearching
    ? (searchQuery.data ?? [])
    : (listQuery.data?.content ?? [])

  if (isLoading && !isSearching) return <ListPageSkeleton />
  if (isError) return <ErrorMessage message="Failed to load contacts." />

  return (
    <div className="space-y-4">
      <PageHeader title="Contacts" description="All pharma contacts" />
      <SearchInput value={query} onChange={(v) => { setQuery(v); goToPage(0) }} placeholder="Search…" className="max-w-sm" />
      <DataTable columns={columns} data={data} onRowClick={(row) => navigate(`/contacts/${row.id}`)} />
      {!isSearching && (
        <Pagination page={page} totalPages={listQuery.data?.totalPages ?? 0} onChange={goToPage} />
      )}
    </div>
  )
}
```

**Step 3 — Tell the lead dev to wire the route.** `src/routes/index.tsx` is off-limits.

**Step 4 — Check your work:**

```bash
npm run check && npm run build
```

### Reference

- `src/features/accounts/` — reference implementation for list, detail, and form pages
- Ask the lead dev before touching any shared file
