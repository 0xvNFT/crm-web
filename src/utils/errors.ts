import axios from 'axios'
import type { ApiError } from '@/api/app-types'

export function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    // Spring Boot error bodies: message (preferred) or error (fallback — can be status name or reason)
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (error.response?.status === 401) return 'Your session has expired. Please sign in again.'
    if (error.response?.status === 404) return 'Resource not found.'
    if (error.response?.status === 402) return 'Plan limit reached. Upgrade your plan to add more records.'
    if (error.response?.status === 403) return 'You do not have permission to perform this action.'
    if (error.response?.status === 409) return 'This record was modified by someone else. Please refresh and try again.'
    if (error.response?.status === 429) return 'Too many requests. Please wait and try again.'
    if (error.message) return error.message
  }
  return 'An unexpected error occurred. Please try again.'
}

export function parseValidationErrors(error: unknown): Record<string, string> | null {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    if (data?.validationErrors) return data.validationErrors
  }
  return null
}
