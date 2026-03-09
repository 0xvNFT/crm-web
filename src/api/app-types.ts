/**
 * App-level type aliases over the auto-generated OpenAPI spec.
 * Import from here in all components — never import from types.ts directly.
 * Run `npm run gen:types` after backend changes, then add new aliases here.
 */
import type { components } from './types'

// ─── Core entities ────────────────────────────────────────────────────────────
export type PharmaAccount            = components['schemas']['PharmaAccount']
export type PharmaContact            = components['schemas']['PharmaContact']
export type PharmaLead               = components['schemas']['PharmaLead']
export type PharmaOrder              = components['schemas']['PharmaOrder']
export type PharmaOrderItem          = components['schemas']['PharmaOrderItem']
export type PharmaQuote              = components['schemas']['PharmaQuote']
export type PharmaQuoteItem          = components['schemas']['PharmaQuoteItem']
export type PharmaActivity           = components['schemas']['PharmaActivity']
export type PharmaFieldVisit         = components['schemas']['PharmaFieldVisit']
export type PharmaTerritory          = components['schemas']['PharmaTerritory']
export type PharmaTeam               = components['schemas']['PharmaTeam']
export type PharmaTeamMember         = components['schemas']['PharmaTeamMember']
export type PharmaProduct            = components['schemas']['PharmaProduct']
export type PharmaProductBatch       = components['schemas']['PharmaProductBatch']
export type PharmaPriceHistory       = components['schemas']['PharmaPriceHistory']
export type PharmaOpportunity        = components['schemas']['PharmaOpportunity']
export type PharmaInvoice            = components['schemas']['PharmaInvoice']
export type PharmaInvoiceItem        = components['schemas']['PharmaInvoiceItem']
export type PharmaMaterial           = components['schemas']['PharmaMaterial']
export type PharmaCoachingNote       = components['schemas']['PharmaCoachingNote']
export type PharmaVisitAudit         = components['schemas']['PharmaVisitAudit']
export type PharmaAccountTerritory   = components['schemas']['PharmaAccountTerritory']
export type PharmaContactAffiliation = components['schemas']['PharmaContactAffiliation']
export type LeadConversionResult     = components['schemas']['LeadConversionResult']
export type User                     = components['schemas']['User']
export type Notification             = components['schemas']['Notification']
export type TenantUserSummary        = components['schemas']['TenantUserSummary']
export type CreateStaffRequest       = components['schemas']['CreateStaffRequest']
export type UpdateStaffRequest       = components['schemas']['UpdateStaffRequest']
export type PageUser                 = components['schemas']['PageUser']

// ─── Paginated results (Spring Page<T>) ───────────────────────────────────────
export type PagePharmaAccount      = components['schemas']['PagePharmaAccount']
export type PagePharmaContact      = components['schemas']['PagePharmaContact']
export type PagePharmaLead         = components['schemas']['PagePharmaLead']
export type PagePharmaOrder        = components['schemas']['PagePharmaOrder']
export type PagePharmaQuote        = components['schemas']['PagePharmaQuote']
export type PagePharmaActivity     = components['schemas']['PagePharmaActivity']
export type PagePharmaFieldVisit   = components['schemas']['PagePharmaFieldVisit']
export type PagePharmaTerritory    = components['schemas']['PagePharmaTerritory']
export type PagePharmaTeam         = components['schemas']['PagePharmaTeam']
export type PagePharmaOpportunity  = components['schemas']['PagePharmaOpportunity']
export type PagePharmaInvoice      = components['schemas']['PagePharmaInvoice']
export type PagePharmaMaterial     = components['schemas']['PagePharmaMaterial']
export type PagePharmaCoachingNote = components['schemas']['PagePharmaCoachingNote']
export type PagePharmaVisitAudit   = components['schemas']['PagePharmaVisitAudit']
export type PageNotification       = components['schemas']['PageNotification']
export type PageApprovalRule       = components['schemas']['PageApprovalRule']

// ─── Reporting (GET /api/pharma/reports/*) ────────────────────────────────────
export type PipelineSummary    = components['schemas']['PipelineSummary']
export type LeadFunnelSummary  = components['schemas']['LeadFunnelSummary']
export type InvoiceAgingSummary = components['schemas']['InvoiceAgingSummary']
export type ActivitySummary    = components['schemas']['ActivitySummary']

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Manually defined — backend login returns token=null in body (it's in the httpOnly cookie)
export interface AuthUser {
  userId: string
  tenantId: string
  email: string
  fullName: string
  roles: string[]
}

// ─── Auth request types — all sourced from generated spec, never manually defined ──
export type LoginRequest          = components['schemas']['LoginRequest']           // { email, password }
export type RegisterRequest       = components['schemas']['RegisterRequest']         // { tenantName, tenantSlug, vertical, firstName, lastName, email, password }
export type ResetPasswordRequest  = components['schemas']['ResetPasswordRequest']   // { token, newPassword }
export type ChangePasswordRequest = components['schemas']['ChangePasswordRequest']  // { currentPassword, newPassword }
export type UpdateProfileRequest  = components['schemas']['UpdateProfileRequest']   // { firstName, lastName }
export type EmailOnlyRequest      = components['schemas']['EmailOnlyRequest']       // { email } — forgot-password, resend-verification
export type AcceptInviteRequest   = components['schemas']['AcceptInviteRequest']    // { token, newPassword }

// ─── Account request types ───────────────────────────────────────────────────
export type CreatePharmaAccountRequest = components['schemas']['CreatePharmaAccountRequest']
export type UpdatePharmaAccountRequest = components['schemas']['UpdatePharmaAccountRequest']

// ─── Territory request types ──────────────────────────────────────────────────
export type CreateTerritoryRequest = components['schemas']['CreateTerritoryRequest']
export type UpdateTerritoryRequest = components['schemas']['UpdateTerritoryRequest']

// ─── Team request types ───────────────────────────────────────────────────────
export type CreateTeamRequest = components['schemas']['CreateTeamRequest']

// ─── Shared request types ────────────────────────────────────────────────────
export type ReasonRequest         = components['schemas']['ReasonRequest']          // { reason } — order/quote/visit reject
export type StageRequest          = components['schemas']['StageRequest']           // { stage } — opportunity advance

// ─── Visit request types ──────────────────────────────────────────────────────
export type ScheduleVisitRequest  = components['schemas']['ScheduleVisitRequest']  // { visit, repId, accountId, contactId?, territoryId? }
export type CheckInRequest        = components['schemas']['CheckInRequest']         // { latitude, longitude }
export type CheckOutRequest       = components['schemas']['CheckOutRequest']        // { outcome, keyDiscussionPoints?, customerFeedback? }
export type SignatureRequest      = components['schemas']['SignatureRequest']       // { signatureImageUrl, capturedByName?, capturedByTitle? }

// ─── API errors ───────────────────────────────────────────────────────────────
export interface ApiError {
  error?: string       // HTTP status name (e.g. "Conflict") — from Spring default error body
  message?: string     // Human-readable backend message — prefer this over error
  validationErrors?: Record<string, string>
}
