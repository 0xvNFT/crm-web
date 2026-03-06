# crm-web — Project Status

> Last updated: 2026-03-06
> Branch: `dev-intern` | Lead dev branch: `0xvnft`

---

## Infrastructure


| Item                                   | Status  | Notes                                                                        |
| -------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| Vite + React + TypeScript scaffold     | Done    | Strict mode, path alias `@/`                                                 |
| Tailwind v4                            | Done    | Configured via `@theme` in `index.css`                                       |
| React Query v5                         | Done    | `QueryProvider` in `src/providers/`                                          |
| React Router v7                        | Done    | Nested routes, lazy-loaded pages                                             |
| Axios client                           | Done    | `withCredentials`, 401 interceptor                                           |
| Auth — httpOnly cookie                 | Done    | Backend fixed. Flow fully wired.                                             |
| AuthProvider + useAuth hook            | Done    | sessionStorage for user metadata                                             |
| PrivateRoute + RoleRoute               | Done    | Location state preserved on redirect                                         |
| AppShell (Sidebar + TopNav)            | Done    | Role-filtered nav items                                                      |
| Shared components                      | Done    | DataTable, Pagination, StatusBadge, LoadingSpinner, ErrorMessage, PageHeader |
| Zod schemas                            | Partial | Auth schemas done. Feature schemas TBD per feature.                          |
| Error utils                            | Done    | `parseApiError`, `parseValidationErrors`                                     |
| Formatter utils                        | Done    | date, dateTime, currency, number                                             |
| `npm run gen:types`                    | Wired   | Run to regenerate `src/api/types.ts` from live Swagger                       |
| `.env.development` / `.env.production` | Done    | API base URL per environment                                                 |


---

## Backend


| Item                      | Status | Notes                                         |
| ------------------------- | ------ | --------------------------------------------- |
| httpOnly cookie on login  | Fixed  | `Set-Cookie` with `HttpOnly; SameSite=Strict` |
| CORS with credentials     | Fixed  | Explicit origins, `allowCredentials(true)`    |
| All pharma endpoints live | Yes    | See API reference in `CLAUDE.md`              |


---

## Feature Pages


| Feature                | List             | Detail | Form | Endpoint hook               | Assigned to | Status      |
| ---------------------- | ---------------- | ------ | ---- | --------------------------- | ----------- | ----------- |
| Auth — Login           | —                | —      | Done | `useLogin`                  | Lead dev    | Done        |
| Auth — Forgot Password | —                | —      | Done | `useForgotPassword`         | Lead dev    | Done        |
| Auth — Reset Password  | —                | —      | —    | `useResetPassword`          | Lead dev    | Pending     |
| Dashboard              | —                | —      | —    | —                           | Lead dev    | Stub only   |
| Accounts               | Done (reference) | —      | —    | `useAccounts`, `useAccount` | Lead dev    | List done   |
| Contacts               | —                | —      | —    | —                           | Intern      | Not started |
| Leads                  | —                | —      | —    | —                           | Intern      | Not started |
| Orders                 | —                | —      | —    | —                           | Intern      | Not started |
| Quotes                 | —                | —      | —    | —                           | Intern      | Not started |
| Activities             | —                | —      | —    | —                           | Intern      | Not started |
| Visits                 | —                | —      | —    | —                           | Intern      | Not started |
| Territories            | —                | —      | —    | —                           | Lead dev    | Not started |
| Teams                  | —                | —      | —    | —                           | Lead dev    | Not started |
| Reports                | —                | —      | —    | —                           | Lead dev    | Not started |
| Admin                  | —                | —      | —    | —                           | Lead dev    | Not started |


---

## PR / Merge Log


| Date       | Branch       | Description           | Status      |
| ---------- | ------------ | --------------------- | ----------- |
| 2026-03-06 | `dev-intern` | Full project scaffold | In progress |


---

## Known Blockers

None currently.

---

## Next Up

### Lead dev (`0xvnft`)

- Dashboard charts (Recharts — pipeline funnel, activity summary)
- `ResetPasswordPage` (token from URL param)
- `AccountDetailPage` — view + edit form
- Territories, Teams pages
- Reports — pipeline, activity, invoice aging, lead funnel

### Interns (`dev-intern`)

- `ContactListPage` + `src/api/endpoints/contacts.ts`
- `LeadListPage` + `src/api/endpoints/leads.ts`
- `OrderListPage` + `src/api/endpoints/orders.ts`
- `QuoteListPage` + `src/api/endpoints/quotes.ts`
- `ActivityListPage` + `src/api/endpoints/activities.ts`
- `VisitListPage` + `src/api/endpoints/visits.ts`

