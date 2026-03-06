/**
 * App-level types not present in the generated OpenAPI spec.
 * Keep this file minimal — prefer generated types from types.ts for all entities.
 */
import type { components } from './types'

// Convenience aliases — use these in components instead of the verbose generated form
export type PharmaAccount = components['schemas']['PharmaAccount']
export type PharmaContact = components['schemas']['PharmaContact']
export type PharmaOrder = components['schemas']['PharmaOrder']
export type PharmaQuote = components['schemas']['PharmaQuote']
export type PharmaLead = components['schemas']['PharmaLead']
export type PharmaActivity = components['schemas']['PharmaActivity']
export type PharmaFieldVisit = components['schemas']['PharmaFieldVisit']
export type PharmaTerritory = components['schemas']['PharmaTerritory']
export type PharmaTeam = components['schemas']['PharmaTeam']
export type PharmaProduct = components['schemas']['PharmaProduct']
export type PharmaOpportunity = components['schemas']['PharmaOpportunity']
export type User = components['schemas']['User']

// Paginated results — matches Spring Page<T> shape
export type PagePharmaAccount = components['schemas']['PagePharmaAccount']
export type PagePharmaContact = components['schemas']['PagePharmaContact']
export type PagePharmaOrder = components['schemas']['PagePharmaOrder']
export type PagePharmaQuote = components['schemas']['PagePharmaQuote']
export type PagePharmaLead = components['schemas']['PagePharmaLead']
export type PagePharmaActivity = components['schemas']['PagePharmaActivity']
export type PagePharmaFieldVisit = components['schemas']['PagePharmaFieldVisit']
export type PagePharmaTerritory = components['schemas']['PagePharmaTerritory']
export type PagePharmaTeam = components['schemas']['PagePharmaTeam']

// Auth — not in the OpenAPI spec (backend returns dynamic JSON for login)
export interface AuthResponse {
  token: string
  userId: string
  tenantId: string
  email: string
  fullName: string
  role: 'ADMIN' | 'MANAGER' | 'FIELD_REP'
}

// API error shape returned by backend
export interface ApiError {
  error: string
  validationErrors?: Record<string, string>
}
