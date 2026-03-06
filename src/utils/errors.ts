import axios from 'axios'
import type { ApiError } from '@/api/app-types'

export function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    // Spring Boot error bodies have: message (human-readable) and error (HTTP status name e.g. "Conflict")
    // Always prefer message first, then error, then status-based fallbacks
    if (data?.message) return data.message
    if (error.response?.status === 404) return 'Resource not found.'
    if (error.response?.status === 403) return 'You do not have permission to perform this action.'
    if (error.response?.status === 429) return 'Too many requests. Please wait and try again.'
    if (error.message) return error.message
  }
  return 'An unexpected error occurred. Please try again.'
}

export function parseValidationErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (data?.validationErrors) return data.validationErrors
  }
  return {}
}
