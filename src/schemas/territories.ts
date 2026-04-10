import { z } from 'zod'
import { notesField, dateField, moneyField, countField } from './primitives'

export const createTerritorySchema = z.object({
  territoryCode:               z.string().trim().min(1, 'Territory code is required'),
  territoryName:               z.string().trim().min(2, 'Territory name must be at least 2 characters'),
  region:                      z.string().trim().min(1, 'Region is required'),
  description:                 notesField,
  status:                      z.string().optional(),
  effectiveFrom:               dateField,
  primaryRepId:                z.string().optional(),
  managerId:                   z.string().optional(),
  targetRevenueAnnual:         moneyField,
  targetVisitsMonthly:         countField,
  targetNewAccountsQuarterly:  countField,
})
export type CreateTerritoryFormData = z.infer<typeof createTerritorySchema>

export const updateTerritorySchema = createTerritorySchema.partial()
export type UpdateTerritoryFormData = z.infer<typeof updateTerritorySchema>
