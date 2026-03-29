import { z } from 'zod'

export const materialEditSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().max(2000).optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  versionNumber: z.string().optional(),
  keywords: z.string().optional(),
  languageCode: z.string().optional(),
  storageUrl: z.string().optional(),
  publishDate: z.string().optional(),
  expirationDate: z.string().optional(),
  status: z.string().optional(),
})
export type MaterialEditFormData = z.infer<typeof materialEditSchema>
