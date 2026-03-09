import { z } from 'zod'

export const createTerritorySchema = z.object({
  territoryCode: z.string().min(1, 'Territory code is required'),
  territoryName: z.string().min(2, 'Territory name must be at least 2 characters'),
  region: z.string().min(1, 'Region is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  effectiveFrom: z.string().optional(),
  targetRevenueAnnual: z.coerce.number().nonnegative().optional(),
  targetVisitsMonthly: z.coerce.number().int().nonnegative().optional(),
  targetNewAccountsQuarterly: z.coerce.number().int().nonnegative().optional(),
})
export type CreateTerritoryFormData = z.infer<typeof createTerritorySchema>

export const updateTerritorySchema = createTerritorySchema.partial()
export type UpdateTerritoryFormData = z.infer<typeof updateTerritorySchema>
