# crm-web — Project Status

> Last updated: 2026-03-13
> Branch: `dev-intern` | Lead dev branch: `0xvnft`

---

## Infrastructure

| Item                                   | Status  | Notes                                                                                                                             |
| -------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Vite + React + TypeScript scaffold     | Done    | Strict mode, path alias `@/`                                                                                                      |
| Tailwind v4                            | Done    | Configured via `@theme` in `index.css`, Geist font, full design token set                                                         |
| React Query v5                         | Done    | `QueryProvider` in `src/providers/`                                                                                               |
| React Router v7                        | Done    | Nested routes, lazy-loaded pages                                                                                                  |
| Axios client                           | Done    | `withCredentials`, 401 interceptor (excludes `/verify-email`)                                                                     |
| Auth — httpOnly cookie                 | Done    | Backend fixed. Flow fully wired.                                                                                                  |
| AuthProvider + useAuth hook            | Done    | sessionStorage for user metadata                                                                                                  |
| PrivateRoute + RoleRoute               | Done    | Location state preserved on redirect                                                                                              |
| AppShell (Sidebar + TopNav)            | Done    | Role-filtered nav, responsive drawer, SidebarProvider pattern                                                                     |
| Shared components                      | Done    | DataTable (TanStack Table v8, sorting, row count), Pagination, StatusBadge, LoadingSpinner, PageHeader, ConfirmDialog, EmptyState |
| Design system atoms                    | Done    | Button (CVA), Input, Label in `src/components/ui/`                                                                                |
| Auth molecules                         | Done    | AuthLayout (split panel), FormField in `src/features/auth/components/`                                                            |
| Zod schemas                            | Partial | Auth, accounts, contacts, visits done. Wave 2 schemas TBD per feature.                                                           |
| Error utils                            | Done    | `parseApiError`, `parseValidationErrors`                                                                                          |
| Formatter utils                        | Done    | date, dateTime, currency (PHP), number, label (snake_case → Title Case)                                                           |
| `npm run gen:types`                    | Done    | Ran 2026-03-13, `src/api/types.ts` synced with live Swagger                                                                       |
| `src/api/app-types.ts`                 | Done    | All entities + request types aliased, reporting types, AuthUser defined                                                           |
| `.env.development` / `.env.production` | Done    | API base URL per environment                                                                                                      |

---

## Backend

| Item                                      | Status | Notes                                                          |
| ----------------------------------------- | ------ | -------------------------------------------------------------- |
| httpOnly cookie on login                  | Done   | `Set-Cookie` with `HttpOnly; SameSite=Strict`                  |
| CORS with credentials                     | Done   | Explicit origins, `allowCredentials(true)`                     |
| All pharma endpoints live                 | Yes    | See API reference in `CLAUDE.md`                               |
| Flat DTOs for orders/quotes/activities    | Done   | `CreateOrderRequest`, `CreateQuoteRequest`, `CreateActivityRequest` now in spec (2026-03-13) |
| Flat DTOs for opportunities               | Done   | `CreateOpportunityRequest`, `UpdateOpportunityRequest` in spec |

---

## Feature Pages

| Feature        | List | Detail | Form | Endpoint hook                                                                                                                                                                      | Assigned to     | Status           |
| -------------- | ---- | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| Auth — Login           | —    | —      | Done | `useLogin`                                                                                                                                                                         | Lead dev        | Done             |
| Auth — Register        | —    | —      | Done | `useRegister`                                                                                                                                                                      | Lead dev        | Done             |
| Auth — Verify Email    | —    | —      | —    | —                                                                                                                                                                                  | Lead dev        | Done             |
| Auth — Forgot Password | —    | —      | Done | `useForgotPassword`                                                                                                                                                                | Lead dev        | Done             |
| Auth — Reset Password  | —    | —      | Done | `useResetPassword`                                                                                                                                                                 | Lead dev        | Done             |
| Dashboard              | —    | —      | —    | reporting hooks                                                                                                                                                                    | Lead dev        | Done             |
| Accounts               | Done | Done   | Done | `useAccounts`, `useAccount`, `useCreateAccount`, `useUpdateAccount`, `useDeleteAccount`, `useAccountSearch`                                                                        | Lead dev        | Complete         |
| Contacts               | Done | Done   | Done | `useContacts`, `useContact`, `useCreateContact`, `useUpdateContact`, `useDeleteContact`, `useContactSearch`                                                                        | Lead dev        | Complete         |
| Profile                | —    | —      | Done | `useUpdateProfile`, `useChangePassword`                                                                                                                                            | Lead dev        | Done             |
| Leads                  | Done | Done   | —    | `useLeads`, `useLead`, `useLeadSearch`, `useCreateLead`, `useUpdateLead`, `useDeleteLead`                                                                                          | spicycakee      | Wave 2 assigned (#16) |
| Orders                 | Done | Done   | —    | `useOrders`, `useOrder`, `useOrderSearch`                                                                                                                                          | Lead dev        | Form TBD         |
| Quotes                 | Done | Done   | —    | `useQuotes`, `useQuote`, `useQuoteSearch`                                                                                                                                          | Lead dev        | Form TBD         |
| Activities             | Done | Done   | —    | `useActivities`, `useActivity`, `useActivitySearch`                                                                                                                                | jaelmusika-cmyk | Wave 2 assigned (#17) |
| Opportunities          | —    | —      | —    | —                                                                                                                                                                                  | MarcLaxa / JaredHLopez | Wave 2 assigned (#18, #19) |
| Visits                 | Done | Done   | Done | `useVisits`, `useVisit`, `useVisitSearch`, `useScheduleVisit`, `useSubmitVisit`, `useApproveVisit`, `useRejectVisit`, `useCheckInVisit`, `useCheckOutVisit`, `useCaptureSignature` | Lead dev        | Complete         |
| Territories            | Done | Done   | Done | `useTerritories`, `useTerritory`, `useTerritorySearch`, `useCreateTerritory`, `useUpdateTerritory`, `useDeleteTerritory`                                                           | Lead dev        | Complete         |
| Teams                  | Done | Done   | Done | `useTeams`, `useTeam`, `useTeamSearch`, `useCreateTeam`, `useUpdateTeam`, `useDeactivateTeam`, `useReactivateTeam`, `useTeamMembers`, `useAddTeamMember`, `useRemoveTeamMember`    | Lead dev        | Complete         |
| Reports                | Done | —      | —    | All 4 report hooks                                                                                                                                                                 | Lead dev        | Done             |
| Admin                  | Done | —      | —    | `useStaff`, `useInviteStaff`, `useDeactivateStaff`, `useReactivateStaff`, `useResendInvite`                                                                                        | Lead dev        | Done             |

---

## Intern Issues (GitHub)

### Wave 1 — Complete

| #  | Assignee        | Feature                               | Status   |
| -- | --------------- | ------------------------------------- | -------- |
| 1  | spicycakee      | LeadListPage + LeadDetailPage         | Merged   |
| 2  | MarcLaxa        | OrderListPage + OrderDetailPage       | Merged   |
| 3  | JaredHLopez     | QuoteListPage + QuoteDetailPage       | Merged   |
| 4  | jaelmusika-cmyk | ActivityListPage + ActivityDetailPage | Merged   |

### Wave 2 — In Progress

| #  | Assignee        | Feature                                      | Status   |
| -- | --------------- | -------------------------------------------- | -------- |
| 16 | spicycakee      | LeadFormPage (create + edit)                 | Assigned |
| 17 | jaelmusika-cmyk | ActivityFormPage (create + edit)             | Assigned |
| 18 | MarcLaxa        | OpportunityListPage + OpportunityDetailPage  | Assigned |
| 19 | JaredHLopez     | OpportunityFormPage (create + edit)          | Assigned |

---

## PR / Merge Log

| Date       | PR  | Branch                  | Description                                                                                        | Status        |
| ---------- | --- | ----------------------- | -------------------------------------------------------------------------------------------------- | ------------- |
| 2026-03-06 | —   | `dev-intern`            | Full project scaffold                                                                              | Merged        |
| 2026-03-07 | —   | `0xvnft`                | Design system, AppShell, Dashboard, Accounts, Contacts, Visits, Territories, Teams, Reports, Admin | Merged        |
| 2026-03-13 | #8  | `feature/activities-v2` | ActivityListPage + ActivityDetailPage                                                              | Merged → main |
| 2026-03-13 | #11 | `feature/orders-v2`     | OrderListPage + OrderDetailPage                                                                    | Merged → main |
| 2026-03-13 | #12 | `feature/quotes-clean`  | QuoteListPage + QuoteDetailPage                                                                    | Merged → main |
| 2026-03-13 | #9  | `feature/leads`         | LeadListPage + LeadDetailPage                                                                      | Merged → main |
| 2026-03-13 | —   | `main`                  | Regenerate types, add request type aliases, wire leads routes                                      | Merged        |

---

## Known Blockers

- `OrderFormPage` and `QuoteFormPage` require line-item UI (product + batch selection) — lead dev work, not intern-ready
- `ConvertLeadRequest` is in spec — lead convert action on `LeadDetailPage` not yet built

---

## Next Up

### Lead dev (`0xvnft`)

- `OrderFormPage` — complex line-item form (products + batches)
- `QuoteFormPage` — complex line-item form
- Lead convert action on `LeadDetailPage`
- Sidebar nav link for Opportunities (once Wave 2 merges)
- Route wiring for Wave 2 pages (lead form, activity form, opportunity pages)

### Interns (`dev-intern`) — Wave 2 (in progress)

- `LeadFormPage` (create + edit) — spicycakee — issue #16
- `ActivityFormPage` (create + edit) — jaelmusika-cmyk — issue #17
- `OpportunityListPage` + `OpportunityDetailPage` — MarcLaxa — issue #18
- `OpportunityFormPage` (create + edit) — JaredHLopez — issue #19
