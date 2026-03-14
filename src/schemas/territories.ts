import { z } from 'zod'

// Enum values are validated by backend @Pattern — keep z.string() here so config-driven
// dropdowns work at runtime. Backend returns 400 with exact message if value is invalid.
export const createTerritorySchema = z.object({
  territoryCode: z.string().min(1, 'Territory code is required'),
  territoryName: z.string().min(2, 'Territory name must be at least 2 characters'),
  region: z.string().min(1, 'Region is required'),
  description: z.string().optional(),
  status: z.string().optional(),
  effectiveFrom: z.string().optional(),
  targetRevenueAnnual: z.number({ coerce: true }).nonnegative().optional(),
  targetVisitsMonthly: z.number({ coerce: true }).int().nonnegative().optional(),
  targetNewAccountsQuarterly: z.number({ coerce: true }).int().nonnegative().optional(),
})
export type CreateTerritoryFormData = z.infer<typeof createTerritorySchema>

export const updateTerritorySchema = createTerritorySchema.partial()
export type UpdateTerritoryFormData = z.infer<typeof updateTerritorySchema>
