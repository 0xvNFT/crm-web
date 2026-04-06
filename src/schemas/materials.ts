import { z } from 'zod'
import { notesField, urlField, dateField } from './primitives'

export const materialEditSchema = z.object({
  title:         z.string().trim().min(1, 'Title is required').optional(),
  description:   notesField,
  fileName:      z.string().trim().optional(),
  fileType:      z.string().optional(),
  category:      z.string().optional(),
  subCategory:   z.string().optional(),
  versionNumber: z.string().trim().optional(),
  keywords:      z.string().trim().optional(),
  languageCode:  z.string().optional(),
  storageUrl:    urlField,
  publishDate:   dateField,
  expirationDate: dateField,
  status:        z.string().optional(),
})
export type MaterialEditFormData = z.infer<typeof materialEditSchema>
