/**
 * App-level type aliases over the auto-generated OpenAPI spec.
 * Import from here in all components — never import from types.ts directly.
 * Run `npm run gen:types` after backend changes, then add new aliases here.
 */
import type { components } from './types'

// ─── Config (GET /api/pharma/config) ─────────────────────────────────────────
// Map of field name → valid string values for all constrained dropdown fields
export type CrmConfig = Record<string, string[]>

// ─── Core entities ────────────────────────────────────────────────────────────
export type PharmaAccount            = components['schemas']['PharmaAccountResponse']
export type PharmaContact            = components['schemas']['PharmaContactResponse']
export type PharmaContactResponse    = components['schemas']['PharmaContactResponse']
export type PharmaLead               = components['schemas']['PharmaLeadResponse']
export type PharmaLeadResponse       = components['schemas']['PharmaLeadResponse']
export type PharmaOrder              = components['schemas']['PharmaOrderResponse']
export type PharmaOrderItem          = components['schemas']['OrderItemResponse']
export type PharmaQuote              = components['schemas']['PharmaQuoteResponse']
export type PharmaQuoteItem          = components['schemas']['QuoteItemResponse']
export type PharmaActivity           = components['schemas']['PharmaActivityResponse']
export type PharmaFieldVisit         = components['schemas']['PharmaFieldVisitResponse']
export type PharmaFieldVisitResponse = components['schemas']['PharmaFieldVisitResponse']
export type PharmaTerritory          = components['schemas']['PharmaTerritoryResponse']
export type PharmaTerritoryResponse  = components['schemas']['PharmaTerritoryResponse']
export type PharmaTeam               = components['schemas']['PharmaTeamResponse']
export type PharmaTeamMember         = components['schemas']['TeamMemberResponse']
export type PharmaProduct            = components['schemas']['PharmaProductResponse']
export type PharmaProductBatch       = components['schemas']['PharmaProductBatchResponse']
export type PharmaPriceHistory       = components['schemas']['PharmaPriceHistoryResponse']
export type PharmaOpportunity        = components['schemas']['PharmaOpportunityResponse']
export type PharmaInvoice            = components['schemas']['PharmaInvoiceResponse']
export type PharmaInvoiceItem        = components['schemas']['InvoiceItemResponse']
export type PharmaMaterial           = components['schemas']['PharmaMaterialResponse']
export type PharmaCoachingNote       = components['schemas']['PharmaCoachingNoteResponse']
export type PharmaVisitAudit         = components['schemas']['PharmaVisitAuditResponse']
export type PharmaAccountTerritory   = components['schemas']['PharmaAccountTerritoryResponse']
export type PharmaContactAffiliation = components['schemas']['PharmaContactAffiliationResponse']
export type LeadConversionResult     = components['schemas']['LeadConversionResult']

// ─── Territory lifecycle types ────────────────────────────────────────────────
export type SecondaryRepInfo         = components['schemas']['SecondaryRepInfo']
export type TerritoryRepInfo         = components['schemas']['TerritoryRepInfo']
export type ProductFocusInfo         = components['schemas']['ProductFocusInfo']
export type AddProductFocusRequest   = components['schemas']['AddProductFocusRequest']

// ─── Visit lifecycle types ────────────────────────────────────────────────────
export type VisitProductInfo         = components['schemas']['VisitProductInfo']
export type VisitMaterialInfo        = components['schemas']['VisitMaterialInfo']
export type AddVisitProductRequest   = components['schemas']['AddVisitProductRequest']
export type AddVisitMaterialRequest  = components['schemas']['AddVisitMaterialRequest']
export type User                     = components['schemas']['User']
// PageStaffResponse content typed as User[] so the roles object shape flows through list/search results
export type PageUser                 = Omit<components['schemas']['PageStaffResponse'], 'content'> & { content?: User[] }
export type Notification             = components['schemas']['Notification']
export type CreateStaffRequest       = Omit<components['schemas']['CreateStaffRequest'], 'role'> & { role: string }
export type UpdateStaffRequest       = Omit<components['schemas']['UpdateStaffRequest'], 'role'> & { role?: string }

// ─── Frontend-owned staff interface — normalized from raw User entity ──────────
// Backend returns User JPA entity from /api/v1/pharma/users with roles as Role objects ({ name, id, ... }).
// StaffMember normalizes this at the API boundary so components never read .roles[0].name directly.
// When backend ships a proper StaffResponse DTO, only mapStaffMember needs updating.
export interface StaffMember {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: string        // normalized from roles[0].name
  jobTitle?: string
  department?: string
  phoneWork?: string
  phoneMobile?: string
  status?: string
  emailVerified?: boolean
  createdAt?: string
  manager?: { id?: string; fullName?: string; firstName?: string; lastName?: string }
}

// ─── Paginated results (Spring Page<T>) ───────────────────────────────────────
export type PagePharmaAccount      = components['schemas']['PagePharmaAccountResponse']
export type PagePharmaContact      = components['schemas']['PagePharmaContactResponse']
export type PagePharmaLead         = components['schemas']['PagePharmaLeadResponse']
export type PagePharmaOrder        = components['schemas']['PagePharmaOrderResponse']
export type PagePharmaQuote        = components['schemas']['PagePharmaQuoteResponse']
export type PagePharmaActivity     = components['schemas']['PagePharmaActivityResponse']
export type PagePharmaFieldVisit   = components['schemas']['PagePharmaFieldVisitResponse']
export type PagePharmaTerritory    = components['schemas']['PagePharmaTerritoryResponse']
export type PagePharmaTeam         = components['schemas']['PagePharmaTeamResponse']
export type PagePharmaProduct      = components['schemas']['PagePharmaProductResponse']
export type PagePharmaOpportunity  = components['schemas']['PagePharmaOpportunityResponse']
export type PagePharmaInvoice      = components['schemas']['PagePharmaInvoiceResponse']
export type PagePharmaMaterial     = components['schemas']['PagePharmaMaterialResponse']
export type PagePharmaCoachingNote = components['schemas']['PagePharmaCoachingNoteResponse']
export type PagePharmaVisitAudit   = components['schemas']['PagePharmaVisitAuditResponse']
export type PharmaNote             = components['schemas']['NoteResponse']
export type PagePharmaNote         = components['schemas']['PageNoteResponse']
export type PageNotification       = components['schemas']['PageNotification']
export type PageApprovalRule       = components['schemas']['PageApprovalRule']
export type AuditEvent             = components['schemas']['AuditEventResponse']
export type PageAuditEvent         = components['schemas']['PageAuditEventResponse']

// ─── Reporting (GET /api/pharma/reports/*) ────────────────────────────────────
export type PipelineSummary    = components['schemas']['PipelineSummary']
export type LeadFunnelSummary  = components['schemas']['LeadFunnelSummary']
export type InvoiceAgingSummary = components['schemas']['InvoiceAgingSummary']
export type ActivitySummary    = components['schemas']['ActivitySummary']

// ─── KPI Reporting (GET /api/pharma/reporting/kpi/*) ─────────────────────────
export type KpiCallSummaryRow          = components['schemas']['CallSummaryDto']
export type KpiActivitySummaryRow      = components['schemas']['ActivitySummaryKpiDto']
export type KpiDoctorCoverageRow       = components['schemas']['DoctorCoverageDto']
export type KpiTerritoryPerformanceRow = components['schemas']['TerritoryPerformanceDto']
export type KpiSalesPerformanceRow     = components['schemas']['SalesPerformanceDto']
export type MyDoctorsRow               = components['schemas']['MyDoctorsRowDto']
export type RepTarget                  = components['schemas']['RepTargetResponse']
export type PageRepTarget              = components['schemas']['PageRepTargetResponse']
export type CreateRepTargetRequest     = components['schemas']['CreateRepTargetRequest']
export type UpdateRepTargetRequest     = components['schemas']['UpdateRepTargetRequest']

export interface KpiPeriod {
  year: number
  month?: number
  quarter?: number
  repId?: string
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
// Role type — use this everywhere, never raw string.
// TypeScript will catch typos like 'FEILD_REP' at compile time.
export const ROLES = ['ADMIN', 'MANAGER', 'FIELD_REP', 'ACCOUNT_MANAGER', 'READ_ONLY', 'CSR'] as const
export type Role = typeof ROLES[number]

// Manually defined — backend login returns token=null in body (it's in the httpOnly cookie)
export interface AuthUser {
  userId: string
  tenantId: string
  email: string
  fullName: string
  roles: Role[]
  mustChangePassword?: boolean
}

// ─── Auth request types ───────────────────────────────────────────────────────
// ─── RegisterRequest — defined manually ──────────────────────────────────────
// POST /api/v1/auth/register is @Hidden when APP_REGISTRATION_ENABLED=false (dedicated deployments).
// gen:types against a registration-disabled instance will omit this schema — keep it here so
// the codebase compiles regardless of deployment mode.
// Only active when VITE_REGISTRATION_ENABLED=true.
export interface RegisterRequest {
  tenantName: string
  tenantSlug: string
  vertical: string
  firstName: string
  lastName: string
  email: string
  password: string
}
export type LoginRequest          = components['schemas']['LoginRequest']           // { email, password }
export type ResetPasswordRequest  = components['schemas']['ResetPasswordRequest']   // { token, newPassword }
export type ChangePasswordRequest = components['schemas']['ChangePasswordRequest']  // { currentPassword, newPassword }
export type UpdateProfileRequest  = components['schemas']['UpdateProfileRequest']   // { firstName, lastName }
export type EmailOnlyRequest      = components['schemas']['EmailOnlyRequest']       // { email } — forgot-password, resend-verification
export type AcceptInviteRequest   = components['schemas']['AcceptInviteRequest']    // { token, newPassword }

// ─── Account request types ───────────────────────────────────────────────────
// Widen config-driven union literals to string — values are validated by backend at runtime
export type CreatePharmaAccountRequest = Omit<components['schemas']['CreatePharmaAccountRequest'], 'accountType' | 'status' | 'paymentTerms' | 'primaryCustomerClass'> & { accountType: string; status?: string; paymentTerms?: string; primaryCustomerClass?: string }
export type UpdatePharmaAccountRequest = Omit<components['schemas']['UpdatePharmaAccountRequest'], 'accountType' | 'status' | 'primaryCustomerClass'> & { accountType?: string; status?: string; primaryCustomerClass?: string }

// ─── Territory request types ──────────────────────────────────────────────────
// Widen config-driven union literals to string — values are validated by backend at runtime
export type CreateTerritoryRequest = Omit<components['schemas']['CreateTerritoryRequest'], 'region' | 'status'> & { region: string; status?: string }
export type UpdateTerritoryRequest = Omit<components['schemas']['UpdateTerritoryRequest'], 'region' | 'status'> & { region?: string; status?: string }

// ─── Team request types ───────────────────────────────────────────────────────
// Widen config-driven union literals to string — values are validated by backend at runtime
export type CreateTeamRequest = Omit<components['schemas']['CreateTeamRequest'], 'teamType'> & { teamType?: string }
export type UpdateTeamRequest = Omit<components['schemas']['UpdateTeamRequest'], 'teamType'> & { teamType?: string }

// ─── Team member response — manually defined (backend DTO not in spec yet) ────
// Backend returns TeamMemberResponse DTO (flat projection, avoids lazy User entity)
// Fields: id, userId, fullName, email, jobTitle, joinedAt
export interface TeamMemberResponse {
  id: string
  userId: string
  fullName: string
  email: string
  jobTitle?: string
  joinedAt: string
}

// ─── Lead request types ───────────────────────────────────────────────────────
// Widen config-driven union literals to string
export type CreateLeadRequest = Omit<components['schemas']['CreateLeadRequest'], 'leadStatus' | 'rating'> & { leadStatus?: string; rating?: string }
export type UpdateLeadRequest = Omit<components['schemas']['UpdateLeadRequest'], 'leadStatus' | 'rating'> & { leadStatus?: string; rating?: string }

// ─── Activity request types ───────────────────────────────────────────────────
// Widen config-driven union literals to string
export type CreateActivityRequest = Omit<components['schemas']['CreateActivityRequest'], 'activityType' | 'status' | 'priority' | 'direction' | 'callResult'> & { activityType: string; status?: string; priority?: string; direction?: string; callResult?: string }
export type UpdateActivityRequest = Omit<components['schemas']['UpdateActivityRequest'], 'status' | 'priority' | 'direction' | 'callResult'> & { status?: string; priority?: string; direction?: string; callResult?: string }

// ─── Contact request types ────────────────────────────────────────────────────
// Widen config-driven union literals to string — values are validated by backend at runtime
export type UpdateContactRequest = Omit<
  components['schemas']['UpdateContactRequest'],
  'contactType' | 'customerType' | 'customerClass' | 'adoptionStage' | 'status' | 'consentStatus'
> & {
  contactType?: string
  customerType?: string
  customerClass?: string
  adoptionStage?: string
  status?: string
  consentStatus?: string
}

// ─── Opportunity request types ────────────────────────────────────────────────
// Widen config-driven union literals to string
export type CreateOpportunityRequest = Omit<components['schemas']['CreateOpportunityRequest'], 'salesStage' | 'forecastCategory'> & { salesStage?: string; forecastCategory?: string }
export type UpdateOpportunityRequest = Omit<components['schemas']['UpdateOpportunityRequest'], 'salesStage' | 'forecastCategory' | 'status'> & { salesStage?: string; forecastCategory?: string; status?: string }

// ─── Product request types ────────────────────────────────────────────────────
// Widen config-driven union literals to string — values are validated by backend at runtime
export type CreateProductRequest = Omit<components['schemas']['CreateProductRequest'], 'status' | 'deaSchedule'> & { status?: string; deaSchedule?: string }
export type UpdateProductRequest = Omit<components['schemas']['UpdateProductRequest'], 'status' | 'deaSchedule'> & { status?: string; deaSchedule?: string }

// ─── Tag types ───────────────────────────────────────────────────────────────
export type PharmaTag           = components['schemas']['TagResponse']
export type PagePharmaTag       = components['schemas']['PageTagResponse']
export type CreateTagRequest    = components['schemas']['CreateTagRequest']
export type UpdateTagRequest    = components['schemas']['UpdateTagRequest']
export type ApplyTagsRequest    = components['schemas']['ApplyTagsRequest']

// ─── Note request types ───────────────────────────────────────────────────────
// noteType is config-driven — widened to string to allow future backend additions without breaking the frontend
export type CreateNoteRequest = Omit<components['schemas']['CreateNoteRequest'], 'noteType'> & { noteType?: string }
export type UpdateNoteRequest = Omit<components['schemas']['UpdateNoteRequest'], 'noteType'> & { noteType?: string }

// ─── Coaching note request types ─────────────────────────────────────────────
// feedbackType and reviewedModule are config-driven — widened to string
export type CreateCoachingNoteRequest = Omit<components['schemas']['CreateCoachingNoteRequest'], 'feedbackType' | 'reviewedModule'> & { feedbackType: string; reviewedModule?: string }
export type UpdateCoachingNoteRequest = Omit<components['schemas']['UpdateCoachingNoteRequest'], 'feedbackType' | 'reviewedModule'> & { feedbackType?: string; reviewedModule?: string }

// ─── Material request types ───────────────────────────────────────────────────
// status is config-driven — widened to string
export type UpdateMaterialRequest = Omit<components['schemas']['UpdateMaterialRequest'], 'status'> & { status?: string }

// ─── Affiliation request types ────────────────────────────────────────────────
export type AddAffiliationRequest = components['schemas']['AddAffiliationRequest']

// ─── Contact create request ───────────────────────────────────────────────────
// Widen config-driven union literals to string
export type CreateContactRequest = Omit<
  components['schemas']['CreateContactRequest'],
  'contactType' | 'customerType' | 'customerClass' | 'adoptionStage' | 'status' | 'consentStatus'
> & {
  contactType: string
  customerType?: string
  customerClass?: string
  adoptionStage?: string
  status?: string
  consentStatus?: string
}

// ─── Invoice request types ────────────────────────────────────────────────────
export type CreateInvoiceRequest  = components['schemas']['CreateInvoiceRequest']
export type UpdateInvoiceRequest  = components['schemas']['UpdateInvoiceRequest']
export type InvoiceItemRequest    = components['schemas']['InvoiceItemRequest']

// ─── Order request types ─────────────────────────────────────────────────────
export type CreateOrderRequest    = components['schemas']['CreateOrderRequest']
export type UpdateOrderRequest    = components['schemas']['UpdateOrderRequest']
export type OrderItemRequest      = components['schemas']['OrderItemRequest']

// ─── Quote request types ──────────────────────────────────────────────────────
export type CreateQuoteRequest    = components['schemas']['CreateQuoteRequest']
export type UpdateQuoteRequest    = components['schemas']['UpdateQuoteRequest']
export type QuoteItemRequest      = components['schemas']['QuoteItemRequest']

// ─── Lead conversion ─────────────────────────────────────────────────────────
export type ConvertLeadRequest    = components['schemas']['ConvertLeadRequest']

// ─── Shared request types ────────────────────────────────────────────────────
export type ReasonRequest         = components['schemas']['ReasonRequest']          // { reason } — order/quote/visit reject
export type StageRequest          = { stage: string }                              // { stage } — opportunity advance; widened from enum literal (config-driven)

// ─── Visit request types ──────────────────────────────────────────────────────
// Widen config-driven union literals to string
export type ScheduleVisitRequest  = Omit<components['schemas']['ScheduleVisitRequest'], 'visitType' | 'priority'> & { visitType: string; priority?: string }
export type CheckInRequest        = components['schemas']['CheckInRequest']         // { latitude, longitude }
// Widen config-driven union literals to string
export type CheckOutRequest       = Omit<components['schemas']['CheckOutRequest'], 'outcome'> & { outcome: string }
export type UpdateVisitRequest    = Omit<components['schemas']['UpdateVisitRequest'], 'visitType' | 'priority' | 'sentiment'> & { visitType?: string; priority?: string; sentiment?: string }
export type SignatureRequest      = components['schemas']['SignatureRequest']       // { signatureImageUrl, capturedByName?, capturedByTitle? }

// ─── Admin (SUPER_ADMIN only — /api/v1/admin/**) ─────────────────────────────
// These schemas are @Hidden in backend Swagger — excluded from gen:types output.
// Defined manually so crm-web type-checks regardless of deployment mode.
// Callers must handle 404 gracefully — treat as "feature not available in this deployment".
export interface PlanResponse {
  id?: string
  name?: string
  description?: string
  tier?: string
  priceMonthly?: number
  priceMonthlyUsd?: number
  priceAnnual?: number
  maxUsers?: number
  maxRecords?: number
  features?: string[]
  active?: boolean
  isActive?: boolean
}
export interface UpdatePlanRequest {
  name?: string
  description?: string
  priceMonthly?: number
  priceAnnual?: number
  maxUsers?: number
  features?: string[]
  active?: boolean
}

// ─── Billing (/api/v1/billing/**) ────────────────────────────────────────────
// @Hidden in Swagger — defined manually. Returns 404 when billing is disabled for this deployment.
// Treat 404 as "feature not available" — not an error.
export interface BillingSubscription {
  id?: string
  planId?: string
  planName?: string
  status?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  canceledAt?: string
  trialEnd?: string
  stripeSubscriptionId?: string
}
export interface CheckoutRequest { planId: string; successUrl: string; cancelUrl: string }
export interface PortalRequest   { returnUrl: string }

// ─── API errors ───────────────────────────────────────────────────────────────
export interface ApiError {
  error?: string       // HTTP status name (e.g. "Conflict") — from Spring default error body
  message?: string     // Human-readable backend message — prefer this over error
  validationErrors?: Record<string, string>
}
