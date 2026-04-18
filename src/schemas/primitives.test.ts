import { describe, it, expect } from 'vitest'
import type { z } from 'zod'
import {
  phoneField,
  emailField,
  emailRequired,
  urlField,
  nameField,
  orgNameField,
  notesField,
  moneyField,
  moneyRequired,
  countField,
  dateField,
  dateRequired,
} from './primitives'

function valid(schema: z.ZodTypeAny, value: unknown) {
  return schema.safeParse(value).success
}

function errorMsg(schema: z.ZodTypeAny, value: unknown): string {
  const result = schema.safeParse(value)
  if (result.success) return ''
  return result.error.issues[0]?.message ?? ''
}

describe('phoneField', () => {
  it('accepts Philippine local format (09...)', () => {
    expect(valid(phoneField, '09171234567')).toBe(true)
  })

  it('accepts E.164 international format', () => {
    expect(valid(phoneField, '+639171234567')).toBe(true)
  })

  it('accepts empty string (optional field)', () => {
    expect(valid(phoneField, '')).toBe(true)
  })

  it('accepts undefined (optional)', () => {
    expect(valid(phoneField, undefined)).toBe(true)
  })

  it('rejects plain words', () => {
    expect(valid(phoneField, 'not-a-phone')).toBe(false)
  })

  it('rejects partial digits', () => {
    expect(valid(phoneField, '123')).toBe(false)
  })

  it('produces a human-readable error message', () => {
    expect(errorMsg(phoneField, 'bad')).toContain('valid phone number')
  })
})

describe('emailField', () => {
  it('accepts valid email', () => {
    expect(valid(emailField, 'user@example.com')).toBe(true)
  })

  it('accepts empty string (optional)', () => {
    expect(valid(emailField, '')).toBe(true)
  })

  it('accepts undefined (optional)', () => {
    expect(valid(emailField, undefined)).toBe(true)
  })

  it('rejects invalid email format', () => {
    expect(valid(emailField, 'notanemail')).toBe(false)
  })

  it('rejects missing @ symbol', () => {
    expect(valid(emailField, 'user.example.com')).toBe(false)
  })
})

describe('emailRequired', () => {
  it('accepts valid email', () => {
    expect(valid(emailRequired, 'admin@cdts.com.ph')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(valid(emailRequired, '')).toBe(false)
  })

  it('rejects invalid format', () => {
    expect(valid(emailRequired, 'notvalid')).toBe(false)
  })
})

describe('urlField', () => {
  it('accepts https URL', () => {
    expect(valid(urlField, 'https://example.com')).toBe(true)
  })

  it('accepts empty string', () => {
    expect(valid(urlField, '')).toBe(true)
  })

  it('accepts undefined', () => {
    expect(valid(urlField, undefined)).toBe(true)
  })

  it('rejects plain text', () => {
    expect(valid(urlField, 'not-a-url')).toBe(false)
  })
})

describe('nameField', () => {
  it('accepts a valid name', () => {
    expect(valid(nameField('First name'), 'Juan')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(valid(nameField('First name'), '')).toBe(false)
  })

  it('rejects string over 100 chars', () => {
    expect(valid(nameField('First name'), 'a'.repeat(101))).toBe(false)
  })

  it('includes label in error message', () => {
    expect(errorMsg(nameField('Last name'), '')).toContain('Last name')
  })

  it('trims whitespace-only values', () => {
    // After trim, '   ' becomes '' which fails min(1)
    expect(valid(nameField('First name'), '   ')).toBe(false)
  })
})

describe('orgNameField', () => {
  it('accepts a valid org name', () => {
    expect(valid(orgNameField('Account name'), 'CDTS Pharma')).toBe(true)
  })

  it('rejects single character', () => {
    expect(valid(orgNameField('Account name'), 'A')).toBe(false)
  })

  it('rejects string over 255 chars', () => {
    expect(valid(orgNameField('Account name'), 'a'.repeat(256))).toBe(false)
  })
})

describe('notesField', () => {
  it('accepts a normal note', () => {
    expect(valid(notesField, 'Some notes here')).toBe(true)
  })

  it('accepts empty string', () => {
    expect(valid(notesField, '')).toBe(true)
  })

  it('accepts undefined', () => {
    expect(valid(notesField, undefined)).toBe(true)
  })

  it('rejects string over 2000 chars', () => {
    expect(valid(notesField, 'a'.repeat(2001))).toBe(false)
  })

  it('accepts exactly 2000 chars', () => {
    expect(valid(notesField, 'a'.repeat(2000))).toBe(true)
  })
})

describe('moneyField', () => {
  it('accepts positive number', () => {
    expect(valid(moneyField, 1234.5)).toBe(true)
  })

  it('accepts zero', () => {
    expect(valid(moneyField, 0)).toBe(true)
  })

  it('accepts numeric string (coercion)', () => {
    expect(valid(moneyField, '1500.75')).toBe(true)
  })

  it('accepts undefined (optional)', () => {
    expect(valid(moneyField, undefined)).toBe(true)
  })

  it('rejects negative number', () => {
    expect(valid(moneyField, -1)).toBe(false)
  })
})

describe('moneyRequired', () => {
  it('accepts positive number', () => {
    expect(valid(moneyRequired, 500)).toBe(true)
  })

  it('accepts zero', () => {
    expect(valid(moneyRequired, 0)).toBe(true)
  })

  it('rejects undefined', () => {
    expect(valid(moneyRequired, undefined)).toBe(false)
  })

  it('rejects negative', () => {
    expect(valid(moneyRequired, -10)).toBe(false)
  })
})

describe('countField', () => {
  it('accepts non-negative integer', () => {
    expect(valid(countField, 5)).toBe(true)
  })

  it('accepts zero', () => {
    expect(valid(countField, 0)).toBe(true)
  })

  it('accepts undefined', () => {
    expect(valid(countField, undefined)).toBe(true)
  })

  it('rejects negative integer', () => {
    expect(valid(countField, -1)).toBe(false)
  })

  it('rejects float', () => {
    expect(valid(countField, 1.5)).toBe(false)
  })
})

describe('dateField', () => {
  it('accepts valid YYYY-MM-DD format', () => {
    expect(valid(dateField, '2025-01-15')).toBe(true)
  })

  it('accepts empty string', () => {
    expect(valid(dateField, '')).toBe(true)
  })

  it('accepts undefined', () => {
    expect(valid(dateField, undefined)).toBe(true)
  })

  it('rejects MM/DD/YYYY format', () => {
    expect(valid(dateField, '01/15/2025')).toBe(false)
  })

  it('rejects plain text', () => {
    expect(valid(dateField, 'not-a-date')).toBe(false)
  })

  it('rejects partial date', () => {
    expect(valid(dateField, '2025-01')).toBe(false)
  })

  it('produces a human-readable error message', () => {
    expect(errorMsg(dateField, 'bad')).toContain('YYYY-MM-DD')
  })
})

describe('dateRequired', () => {
  it('accepts valid YYYY-MM-DD format', () => {
    expect(valid(dateRequired('Start date'), '2025-01-15')).toBe(true)
  })

  it('rejects empty string with label-specific message', () => {
    expect(valid(dateRequired('Start date'), '')).toBe(false)
    expect(errorMsg(dateRequired('Start date'), '')).toContain('Start date is required')
  })

  it('rejects undefined', () => {
    expect(valid(dateRequired('Due date'), undefined)).toBe(false)
  })

  it('rejects non-YYYY-MM-DD format', () => {
    expect(valid(dateRequired('Due date'), '01/15/2025')).toBe(false)
    expect(errorMsg(dateRequired('Due date'), '01/15/2025')).toContain('YYYY-MM-DD')
  })

  it('rejects plain text', () => {
    expect(valid(dateRequired('Due date'), 'today')).toBe(false)
  })
})
