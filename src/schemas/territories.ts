import { z } from 'zod'

// Enum values are validated by backend @Pattern — keep z.string() here so config-driven
// dropdowns work at runtime. Backend returns 400 with exact message if value is invalid.
export const createTerritorySchema = z.object({
  territoryCode: z.string().min(1, 'Territory code is required'),
  territoryName: z.string().min(2, 'Territory name must be at least 2 characters'),
  region: z.string().min(1, 'Region is required'),
  description: z.string().max(2000).optional(),
  status: z.string().optional().transform(v => v || undefined),
  effectiveFrom: z.string().optional(),
  primaryRepId: z.string().optional(),
  managerId: z.string().optional(),
  targetRevenueAnnual: z.coerce.number<number>().nonnegative().optional(),
  targetVisitsMonthly: z.coerce.number<number>().int().nonnegative().optional(),
  targetNewAccountsQuarterly: z.coerce.number<number>().int().nonnegative().optional(),
})
export type CreateTerritoryFormData = z.infer<typeof createTerritorySchema>

export const updateTerritorySchema = createTerritorySchema.partial()
export type UpdateTerritoryFormData = z.infer<typeof updateTerritorySchema>
