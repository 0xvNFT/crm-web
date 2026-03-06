# crm-web — Pharma Field Force CRM

Frontend web app for the Pharma Field Force Management CRM.

**Stack:** React 19 · Vite 7 · TypeScript · Tailwind CSS v4 · React Query v5 · React Router v7 · Axios · Zod v4 · React Hook Form

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
# 1. Clone the repo
git clone <repo-url>
cd crm-web

# 2. Switch to your branch
git checkout dev-intern

# 3. Install dependencies
npm install

# 4. Set up your environment file
cp .env.example .env.development
# Ask the lead dev to fill in the API URL

# 5. Start the dev server
npm run dev
```

Open `http://localhost:5173` — the login page should load.

---

## Environment

Env files are **not committed**. Copy `.env.example` to get started.

| File | Used when | Notes |
|---|---|---|
| `.env.development` | `npm run dev` | Create this from `.env.example` |
| `.env.production` | `npm run build` | Set by the lead dev / CI |

**Never hardcode the API URL.** Always use `import.meta.env.VITE_API_BASE_URL`.

---

## Available Scripts

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build (runs typecheck first)
npm run typecheck    # TypeScript check — run before every PR
npm run lint         # ESLint
npm run preview      # Preview the production build locally
npm run gen:types    # Regenerate API types from live Swagger spec
```

**Run `npm run typecheck` before opening any PR.** Fix all errors — do not ignore them.

---

## Project Structure

```
src/
├── api/
│   ├── client.ts          ← Axios instance — DO NOT TOUCH
│   ├── types.ts           ← Auto-generated from Swagger — never edit manually
│   ├── app-types.ts       ← Type aliases you import in your code — DO NOT TOUCH
│   └── endpoints/         ← One file per resource (your query hooks go here)
├── components/
│   ├── layout/            ← AppShell, Sidebar, TopNav — DO NOT TOUCH
│   └── shared/            ← DataTable, Pagination, StatusBadge, etc. — use, don't modify
├── features/              ← YOUR WORK GOES HERE
│   ├── accounts/          ← REFERENCE — copy this pattern for your feature
│   └── [your-feature]/    ← Create your files here
├── hooks/
│   ├── useAuth.ts         ← Access the logged-in user
│   └── usePagination.ts   ← Use for all list pages
├── providers/             ← DO NOT TOUCH
├── routes/                ← DO NOT TOUCH
├── schemas/               ← Zod schemas for forms
└── utils/
    ├── formatters.ts      ← Date, currency helpers
    └── errors.ts          ← API error parsing
```

---

## Files You Must NOT Touch

Changes here break everyone's work. Talk to the lead dev first.

- `src/api/client.ts`
- `src/api/types.ts`
- `src/api/app-types.ts`
- `src/providers/`
- `src/routes/`
- `src/components/layout/`
- `src/index.css`
- `vite.config.ts`, `tsconfig.app.json`, `package.json`

---

## Git Flow

### Overview

```
main          ← stable scaffold, production-ready code only
  └── dev-intern   ← your branch — all intern work happens here
        └── feature/contacts   ← one branch per feature you build
        └── feature/leads
        └── feature/orders
```

You never commit directly to `dev-intern`. You branch off it, do your work, then open a PR back into `dev-intern`. The lead dev reviews before anything merges.

---

### Starting a Feature

Always start from an up-to-date `dev-intern`:

```bash
# Make sure you're on dev-intern and it's up to date
git checkout dev-intern
git pull origin dev-intern

# Create your feature branch
git checkout -b feature/contacts
```

Branch naming: `feature/<name>` — lowercase, hyphenated.

```
feature/contacts
feature/leads
feature/order-list
```

---

### While You're Working

Commit small and often. Each commit should do one clear thing.

```bash
# Stage only the files you changed
git add src/api/endpoints/contacts.ts
git add src/features/contacts/ContactListPage.tsx

# Write a clear commit message
git commit -m "feat(contacts): add useContacts hook and ContactListPage"
```

**Commit message format:** `type(scope): short description`

| Type | When to use |
|---|---|
| `feat` | New component, hook, or page |
| `fix` | Bug fix |
| `style` | Formatting, spacing — no logic change |
| `refactor` | Restructuring code without changing behavior |
| `chore` | Config, deps, cleanup |

Examples:
```
feat(contacts): add ContactListPage with pagination
feat(leads): add useLeads hook
fix(contacts): handle empty phone field
style(contacts): align table column widths
```

---

### Before Opening a PR

Run these — both must pass:

```bash
npm run typecheck   # zero TypeScript errors
npm run build       # build must succeed
```

If either fails, fix it before asking for review.

---

### Opening a PR

Push your branch and open a PR into `dev-intern` (not `main`):

```bash
git push origin feature/contacts
```

Then go to GitHub → New Pull Request → base: `dev-intern` ← compare: `feature/contacts`.

**PR title format:** same as commit messages — `feat(contacts): add ContactListPage`

In the PR description, briefly note:
- What you built
- Any decisions you made (e.g. which fields you chose to display)
- Anything you're unsure about

---

### Keeping Your Branch Up to Date

If `dev-intern` gets new commits while you're working, pull them into your branch:

```bash
git checkout dev-intern
git pull origin dev-intern
git checkout feature/contacts
git merge dev-intern
```

Resolve any conflicts, then continue working.

---

### What NOT to Do

- Do not commit directly to `dev-intern` or `main`
- Do not push to someone else's feature branch
- Do not force push (`git push --force`) — ever
- Do not open PRs against `main` — always target `dev-intern`
- Do not commit `.env` files — they are gitignored for a reason

---

## Your Task Format

You'll receive a task like this:

```
Feature: Contacts
Files to create:
  - src/features/contacts/ContactListPage.tsx
  - src/api/endpoints/contacts.ts
Pattern to copy: src/features/accounts/AccountListPage.tsx
API endpoint: GET /api/pharma/contacts
Fields to display: firstName, lastName, email, phone, title, createdAt
```

---

## Step-by-Step: Building a List Page

### Step 1 — Create the endpoint hook

`src/api/endpoints/contacts.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import client from '@/api/client'
import type { PagePharmaContact } from '@/api/app-types'

export function useContacts(page = 0) {
  return useQuery({
    queryKey: ['contacts', 'list', page],
    queryFn: () =>
      client
        .get<PagePharmaContact>('/api/pharma/contacts', { params: { page, size: 20, sort: 'createdAt,desc' } })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  })
}
```

> Use `placeholderData: (prev) => prev` — not `keepPreviousData`. That was removed in React Query v5.

> Import types from `@/api/app-types`, not `@/api/types`.

### Step 2 — Create the page component

`src/features/contacts/ContactListPage.tsx`:

```typescript
import { useContacts } from '@/api/endpoints/contacts'
import { usePagination } from '@/hooks/usePagination'
import { DataTable, type Column } from '@/components/shared/DataTable'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { PageHeader } from '@/components/shared/PageHeader'
import { formatDate } from '@/utils/formatters'
import type { PharmaContact } from '@/api/app-types'

const columns: Column<PharmaContact>[] = [
  { header: 'First Name', accessor: 'firstName' },
  { header: 'Last Name', accessor: 'lastName' },
  { header: 'Email', accessor: (row) => row.email ?? '—' },
  { header: 'Phone', accessor: (row) => row.phone ?? '—' },
  { header: 'Title', accessor: (row) => row.title ?? '—' },
  { header: 'Created', accessor: (row) => formatDate(row.createdAt) },
]

export default function ContactListPage() {
  const { page, goToPage } = usePagination()
  const { data, isLoading, isError } = useContacts(page)

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage />

  return (
    <div className="space-y-4">
      <PageHeader title="Contacts" description="All pharma contacts" />
      <DataTable columns={columns} data={data?.content ?? []} />
      <Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
    </div>
  )
}
```

### Step 3 — Tell the lead dev to wire the route

`src/routes/index.tsx` is off-limits. Once your component is done, tell the lead dev — they'll swap the placeholder.

### Step 4 — Check your work

```bash
npm run typecheck   # must pass with zero errors
npm run build       # must pass
```

---

## Rules

### TypeScript
- No `any` — ever.
- No type assertions (`as SomeType`) without a comment explaining why.
- Import types from `@/api/app-types` — never define your own API response types.

### Components
- Functional components only.
- One component per file. Filename = component name.
- Pages use `export default`. Shared components use named exports.
- No inline styles — Tailwind classes only.

### Data Fetching
- React Query for everything — no `useEffect` + `useState` for API calls.
- Always handle `isLoading` and `isError`.
- Use `data?.content ?? []` and `data?.totalPages ?? 0` — data is `undefined` while loading.

### Forms
- React Hook Form + Zod always together.
- Schema in `src/schemas/[feature].ts`, not in the component.

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| `keepPreviousData: true` | Use `placeholderData: (prev) => prev` |
| `data.content` without `?.` | Use `data?.content ?? []` |
| Relative imports (`../../api/client`) | Use `@/api/client` |
| Importing from `@/api/types` | Import from `@/api/app-types` |
| Defining your own API types | Use aliases from `@/api/app-types` |
| Named export on a page | Pages use `export default function MyPage()` |
| Hardcoding the API URL | Use `client` from `@/api/client` |
| Editing files outside your feature folder | Don't. Talk to the lead dev. |

---

## Shared Components Reference

### `DataTable<T>`

```typescript
import { DataTable, type Column } from '@/components/shared/DataTable'

const columns: Column<MyType>[] = [
  { header: 'Name', accessor: 'name' },
  { header: 'Status', accessor: (row) => <StatusBadge status={row.status ?? ''} /> },
  { header: 'Date', accessor: (row) => formatDate(row.createdAt) },
]

<DataTable columns={columns} data={data?.content ?? []} />
```

### `Pagination`

```typescript
import { Pagination } from '@/components/shared/Pagination'

<Pagination page={page} totalPages={data?.totalPages ?? 0} onChange={goToPage} />
```

### `StatusBadge`

```typescript
import { StatusBadge } from '@/components/shared/StatusBadge'

<StatusBadge status={row.status ?? ''} />
```

### `PageHeader`

```typescript
import { PageHeader } from '@/components/shared/PageHeader'

<PageHeader
  title="Contacts"
  description="Manage all pharma contacts"
  actions={<button>Add Contact</button>}
/>
```

### `useAuth`

```typescript
import { useAuth } from '@/hooks/useAuth'

const { user } = useAuth()
// user.role → 'ADMIN' | 'MANAGER' | 'FIELD_REP'
// user.fullName, user.email
```

### `formatDate` / `formatCurrency`

```typescript
import { formatDate, formatCurrency } from '@/utils/formatters'

formatDate('2026-03-06T10:00:00Z')  // → "Mar 6, 2026"
formatCurrency(1500, 'USD')          // → "$1,500.00"
```

---

## Getting Help

- Read `src/features/accounts/AccountListPage.tsx` — it is the reference pattern.
- Check `STATUS.md` to see what's been built and what's pending.
- Ask the lead dev before touching any shared file.
