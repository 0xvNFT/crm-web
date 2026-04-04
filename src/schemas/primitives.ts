/**
 * Shared Zod field primitives — import these in every schema instead of redefining.
 *
 * Rules:
 * - z.email() / z.url() top-level (NOT z.string().email() — deprecated in Zod v4)
 * - Phone accepts Philippine local (09XXXXXXXXX) or E.164 international (+XXXXXXXXXXX)
 * - All text fields use .trim() to reject leading/trailing-whitespace-only input
 * - Use .optional().or(z.literal('')) for fields that may arrive as '' from controlled inputs
 */
import { z } from 'zod'

// ─── Phone ────────────────────────────────────────────────────────────────────
// Accepts: +63XXXXXXXXXX, +1XXXXXXXXXX (any E.164), 09XXXXXXXXX (PH local), 02XXXXXXXX (PH landline)
// Rejects: plain words, partial digits, anything that isn't a recognisable number format
const PHONE_REGEX = /^(\+\d{7,15}|0\d{9,10})$/

/** Optional phone field — accepts E.164 (+63...) or Philippine local (09...) or empty string */
export const phoneField = z
  .string()
  .trim()
  .regex(PHONE_REGEX, 'Enter a valid phone number (e.g. +639171234567 or 09171234567)')
  .optional()
  .or(z.literal(''))

// ─── Email ────────────────────────────────────────────────────────────────────
/** Optional email field — empty string treated as "not provided" */
export const emailField = z
  .email('Must be a valid email address')
  .optional()
  .or(z.literal(''))

/** Required email field */
export const emailRequired = z.email('Email is required')

// ─── URL ──────────────────────────────────────────────────────────────────────
/** Optional URL field — must start with https:// or http:// when provided */
export const urlField = z
  .url('Must be a valid URL (e.g. https://example.com)')
  .optional()
  .or(z.literal(''))

// ─── Names ───────────────────────────────────────────────────────────────────
/** Person first/last name — trimmed, 1–100 chars */
export const nameField = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(100, `${label} must be 100 characters or less`)

/** Organisation / entity name — trimmed, 2–255 chars */
export const orgNameField = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(255, `${label} must be 255 characters or less`)

// ─── Notes / free text ───────────────────────────────────────────────────────
/** Long-form notes textarea — max 2000 chars */
export const notesField = z.string().max(2000, 'Notes must be 2000 characters or less').optional()

// ─── Numbers ─────────────────────────────────────────────────────────────────
/** Non-negative decimal — for money, revenue, etc. */
export const moneyField = z.coerce.number<number>().nonnegative('Must be 0 or greater').optional()

/** Non-negative integer — for counts, quantities */
export const countField = z.coerce.number<number>().int().nonnegative().optional()

// ─── Dates ───────────────────────────────────────────────────────────────────
/** ISO date string from <input type="date"> — YYYY-MM-DD */
export const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date (YYYY-MM-DD)')
  .optional()
  .or(z.literal(''))
