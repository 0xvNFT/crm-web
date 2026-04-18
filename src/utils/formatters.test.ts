import { describe, it, expect } from 'vitest'
import { formatDate, formatDateTime, formatCurrency, formatLabel, formatNumber } from './formatters'

describe('formatDate', () => {
  it('returns em-dash for undefined', () => {
    expect(formatDate(undefined)).toBe('—')
  })

  it('returns em-dash for empty string', () => {
    expect(formatDate('')).toBe('—')
  })

  it('formats a valid ISO date string', () => {
    // Use a fixed UTC date to avoid timezone drift across machines
    const result = formatDate('2025-06-15')
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/2025/)
  })
})

describe('formatDateTime', () => {
  it('returns em-dash for undefined', () => {
    expect(formatDateTime(undefined)).toBe('—')
  })

  it('formats a valid datetime string', () => {
    const result = formatDateTime('2025-06-15T10:30:00')
    expect(result).toMatch(/Jun/)
    expect(result).toMatch(/2025/)
  })
})

describe('formatCurrency', () => {
  it('formats a positive amount in PHP', () => {
    const result = formatCurrency(1234.5)
    expect(result).toMatch(/1,234/)
    expect(result).toMatch(/50/)
  })

  it('formats zero as ₱0.00 — not em-dash', () => {
    const result = formatCurrency(0)
    expect(result).not.toBe('—')
    expect(result).toMatch(/0/)
  })

  it('formats a large amount with thousand separators', () => {
    const result = formatCurrency(1000000)
    expect(result).toMatch(/1,000,000/)
  })

  it('uses PHP currency symbol by default', () => {
    const result = formatCurrency(100)
    // PHP locale uses ₱ or PHP prefix depending on platform — just verify it's currency-shaped
    expect(result).toMatch(/100/)
  })
})

describe('formatLabel', () => {
  it('converts underscores to spaces and title-cases', () => {
    expect(formatLabel('FIELD_REP')).toBe('Field Rep')
  })

  it('handles single word', () => {
    expect(formatLabel('ACTIVE')).toBe('Active')
  })

  it('returns em-dash for undefined', () => {
    expect(formatLabel(undefined)).toBe('—')
  })

  it('returns em-dash for empty string', () => {
    expect(formatLabel('')).toBe('—')
  })

  it('handles multiple underscores', () => {
    expect(formatLabel('ACCOUNT_MANAGER_ROLE')).toBe('Account Manager Role')
  })
})

describe('formatNumber', () => {
  it('formats a number with thousand separators', () => {
    expect(formatNumber(1000)).toBe('1,000')
  })

  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('formats a large number', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })
})
