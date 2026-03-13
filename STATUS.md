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
| Zod schemas                            | Partial | Auth schemas done. Feature schemas TBD per feature.                                                                               |
| Error utils                            | Done    | `parseApiError`, `parseValidationErrors`                                                                                          |
| Formatter utils                        | Done    | date, dateTime, currency (PHP), number, label (snake_case → Title Case)                                                           |
| `npm run gen:types`                    | Done    | Ran 2026-03-07, `src/api/types.ts` synced with live Swagger                                                                       |
| `src/api/app-types.ts`                 | Done    | All entities aliased, reporting types, AuthUser defined                                                                           |
| `.env.development` / `.env.production` | Done    | API base URL per environment                                                                                                      |


---

## Backend


| Item                      | Status | Notes                                         |
| ------------------------- | ------ | --------------------------------------------- |
| httpOnly cookie on login  | Done   | `Set-Cookie` with `HttpOnly; SameSite=Strict` |
| CORS with credentials     | Done   | Explicit origins, `allowCredentials(true)`    |
| All pharma endpoints live | Yes    | See API reference in `CLAUDE.md`              |


---

## Feature Pages


| Feature                | List | Detail | Form | Endpoint hook                                                                                                                                                                      | Assigned to     | Status              |
| ---------------------- | ---- | ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------- |
| Auth — Login           | —    | —      | Done | `useLogin`                                                                                                                                                                         | Lead dev        | Done                |
| Auth — Register        | —    | —      | Done | `useRegister`                                                                                                                                                                      | Lead dev        | Done                |
| Auth — Verify Email    | —    | —      | —    | —                                                                                                                                                                                  | Lead dev        | Done                |
| Auth — Forgot Password | —    | —      | Done | `useForgotPassword`                                                                                                                                                                | Lead dev        | Done                |
| Auth — Reset Password  | —    | —      | Done | `useResetPassword`                                                                                                                                                                 | Lead dev        | Done                |
| Dashboard              | —    | —      | —    | reporting hooks                                                                                                                                                                    | Lead dev        | Done                |
| Accounts               | Done | Done   | Done | `useAccounts`, `useAccount`, `useCreateAccount`, `useUpdateAccount`, `useDeleteAccount`, `useAccountSearch`                                                                        | Lead dev        | Complete            |
| Contacts               | Done | Done   | Done | `useContacts`, `useContact`, `useCreateContact`, `useUpdateContact`, `useDeleteContact`, `useContactSearch`                                                                        | Lead dev        | Complete            |
| Profile                | —    | —      | Done | `useUpdateProfile`, `useChangePassword`                                                                                                                                            | Lead dev        | Done                |
| Leads                  | —    | —      | —    | —                                                                                                                                                                                  | spicycakee      | PR open (needs fix) |
| Orders                 | Done | Done   | —    | `useOrders`, `useOrder`, `useOrderSearch`                                                                                                                                          | MarcLaxa        | Merged (#11)        |
| Quotes                 | Done | Done   | —    | `useQuotes`, `useQuote`, `useQuoteSearch`                                                                                                                                          | JaredHLopez     | PR open (#12)       |
| Activities             | Done | Done   | —    | `useActivities`, `useActivity`, `useActivitySearch`                                                                                                                                | jaelmusika-cmyk | Merged (#8)         |
| Visits                 | Done | Done   | Done | `useVisits`, `useVisit`, `useVisitSearch`, `useScheduleVisit`, `useSubmitVisit`, `useApproveVisit`, `useRejectVisit`, `useCheckInVisit`, `useCheckOutVisit`, `useCaptureSignature` | Lead dev        | Complete            |
| Territories            | Done | Done   | Done | `useTerritories`, `useTerritory`, `useTerritorySearch`, `useCreateTerritory`, `useUpdateTerritory`, `useDeleteTerritory`                                                           | Lead dev        | Complete            |
| Teams                  | Done | Done   | Done | `useTeams`, `useTeam`, `useTeamSearch`, `useCreateTeam`, `useUpdateTeam`, `useDeactivateTeam`, `useReactivateTeam`, `useTeamMembers`, `useAddTeamMember`, `useRemoveTeamMember`    | Lead dev        | Complete            |
| Reports                | Done | —      | —    | All 4 report hooks                                                                                                                                                                 | Lead dev        | Done                |
| Admin                  | Done | —      | —    | `useStaff`, `useInviteStaff`, `useDeactivateStaff`, `useReactivateStaff`, `useResendInvite`                                                                                        | Lead dev        | Done                |


---

## Intern Issues (GitHub)


| #   | Assignee        | Feature                               | Issue URL                                                                                |
| --- | --------------- | ------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1   | spicycakee      | LeadListPage + LeadDetailPage         | [https://github.com/0xvNFT/crm-web/issues/1](https://github.com/0xvNFT/crm-web/issues/1) |
| 2   | MarcLaxa        | OrderListPage + OrderDetailPage       | [https://github.com/0xvNFT/crm-web/issues/2](https://github.com/0xvNFT/crm-web/issues/2) |
| 3   | JaredHLopez     | QuoteListPage + QuoteDetailPage       | [https://github.com/0xvNFT/crm-web/issues/3](https://github.com/0xvNFT/crm-web/issues/3) |
| 4   | jaelmusika-cmyk | ActivityListPage + ActivityDetailPage | [https://github.com/0xvNFT/crm-web/issues/4](https://github.com/0xvNFT/crm-web/issues/4) |


---

## PR / Merge Log


| Date       | PR  | Branch                  | Description                                                                                        | Status                |
| ---------- | --- | ----------------------- | -------------------------------------------------------------------------------------------------- | --------------------- |
| 2026-03-06 | —   | `dev-intern`            | Full project scaffold                                                                              | Merged                |
| 2026-03-07 | —   | `0xvnft`                | Design system, AppShell, Dashboard, Accounts, Contacts, Visits, Territories, Teams, Reports, Admin | Merged                |
| 2026-03-13 | #8  | `feature/activities-v2` | ActivityListPage + ActivityDetailPage                                                              | Merged → dev-intern   |
| 2026-03-13 | #11 | `feature/orders-v2`     | OrderListPage + OrderDetailPage                                                                    | Merged → dev-intern   |
| 2026-03-13 | #13 | `dev-intern`            | Orders + Activities → main                                                                         | Merged → main         |
| 2026-03-13 | #12 | `feature/quotes-clean`  | QuoteListPage + QuoteDetailPage                                                                    | Open — ready to merge |


---

## Known Blockers

None currently.

---

## Next Up

### Lead dev (`0xvnft`)

- ~~Visits — check-in / check-out flow~~ — DONE
- Territories + Teams pages
- ~~Notifications bell~~ — DONE
- ~~Reports page~~ — DONE
- ~~Admin page (Team Management)~~ — DONE
- ~~Accept Invite page (`/accept-invite`)~~ — DONE

### Interns (`dev-intern`) — Wave 1 (in progress)

- `LeadListPage` + `LeadDetailPage` — spicycakee
- `OrderListPage` + `OrderDetailPage` — MarcLaxa
- `QuoteListPage` + `QuoteDetailPage` — JaredHLopez
- `ActivityListPage` + `ActivityDetailPage` — jaelmusika-cmyk

### Interns (`dev-intern`) — Wave 2 (after Wave 1 PRs merged)

- `VisitListPage` + `VisitDetailPage`

