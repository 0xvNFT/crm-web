import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { parseApiError, parseValidationErrors, applyServerErrors } from './errors'

function makeAxiosError(status?: number, data?: object, message?: string) {
  const response = status
    ? ({ status, data: data ?? {}, statusText: '', headers: {}, config: {} as InternalAxiosRequestConfig } satisfies AxiosResponse)
    : undefined
  return new axios.AxiosError(message ?? 'Request failed', 'ERR_BAD_RESPONSE', undefined, undefined, response)
}

describe('parseApiError', () => {
  it('returns data.message when present', () => {
    const err = makeAxiosError(400, { message: 'Validation failed' })
    expect(parseApiError(err)).toBe('Validation failed')
  })

  it('falls back to data.error when message is absent', () => {
    const err = makeAxiosError(400, { error: 'Bad Request' })
    expect(parseApiError(err)).toBe('Bad Request')
  })

  it('returns session expired message for 401', () => {
    const err = makeAxiosError(401, {})
    expect(parseApiError(err)).toBe('Your session has expired. Please sign in again.')
  })

  it('returns not found message for 404', () => {
    const err = makeAxiosError(404, {})
    expect(parseApiError(err)).toBe('Resource not found.')
  })

  it('returns plan limit message for 402', () => {
    const err = makeAxiosError(402, {})
    expect(parseApiError(err)).toBe('Plan limit reached. Upgrade your plan to add more records.')
  })

  it('returns permission message for 403', () => {
    const err = makeAxiosError(403, {})
    expect(parseApiError(err)).toBe('You do not have permission to perform this action.')
  })

  it('returns conflict message for 409', () => {
    const err = makeAxiosError(409, {})
    expect(parseApiError(err)).toBe('This record was modified by someone else. Please refresh and try again.')
  })

  it('returns rate limit message for 429', () => {
    const err = makeAxiosError(429, {})
    expect(parseApiError(err)).toBe('Too many requests. Please wait and try again.')
  })

  it('returns server error message for 500', () => {
    const err = makeAxiosError(500, {})
    expect(parseApiError(err)).toBe('A server error occurred. Please try again later.')
  })

  it('returns server error message for 503', () => {
    const err = makeAxiosError(503, {})
    expect(parseApiError(err)).toBe('A server error occurred. Please try again later.')
  })

  it('uses error.message when no status code', () => {
    const err = new axios.AxiosError('Network Error', 'ERR_NETWORK')
    expect(parseApiError(err)).toBe('Network Error')
  })

  it('returns generic message for non-Axios errors', () => {
    expect(parseApiError(new Error('something'))).toBe('An unexpected error occurred. Please try again.')
    expect(parseApiError('string error')).toBe('An unexpected error occurred. Please try again.')
    expect(parseApiError(null)).toBe('An unexpected error occurred. Please try again.')
  })

  it('prefers data.message over status-based fallback', () => {
    const err = makeAxiosError(401, { message: 'Token blacklisted' })
    expect(parseApiError(err)).toBe('Token blacklisted')
  })
})

describe('parseValidationErrors', () => {
  it('returns validationErrors map when present', () => {
    const err = makeAxiosError(422, { validationErrors: { email: 'Invalid email', name: 'Required' } })
    expect(parseValidationErrors(err)).toEqual({ email: 'Invalid email', name: 'Required' })
  })

  it('returns null when validationErrors is absent', () => {
    const err = makeAxiosError(400, { message: 'Bad request' })
    expect(parseValidationErrors(err)).toBeNull()
  })

  it('returns null for non-Axios errors', () => {
    expect(parseValidationErrors(new Error('other'))).toBeNull()
    expect(parseValidationErrors(null)).toBeNull()
  })
})

describe('applyServerErrors', () => {
  it('calls setError for each field when validationErrors present', () => {
    const err = makeAxiosError(422, { validationErrors: { email: 'Invalid email', name: 'Required' } })
    const setError = vi.fn()
    const fallback = vi.fn()
    applyServerErrors(err, setError, fallback)
    expect(setError).toHaveBeenCalledWith('email', { type: 'server', message: 'Invalid email' })
    expect(setError).toHaveBeenCalledWith('name', { type: 'server', message: 'Required' })
    expect(fallback).not.toHaveBeenCalled()
  })

  it('calls fallback with parseApiError when no validationErrors', () => {
    const err = makeAxiosError(500, {})
    const setError = vi.fn()
    const fallback = vi.fn()
    applyServerErrors(err, setError, fallback)
    expect(setError).not.toHaveBeenCalled()
    expect(fallback).toHaveBeenCalledWith('A server error occurred. Please try again later.')
  })

  it('calls fallback for non-Axios errors', () => {
    const setError = vi.fn()
    const fallback = vi.fn()
    applyServerErrors(new Error('something'), setError, fallback)
    expect(setError).not.toHaveBeenCalled()
    expect(fallback).toHaveBeenCalledWith('An unexpected error occurred. Please try again.')
  })
})
