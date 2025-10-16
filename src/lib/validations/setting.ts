import { z } from 'zod'

export const settingSchema = z.object({
  key: z.string().min(1, 'La clé est requise'),
  value: z.string(),
  type: z.enum(['string', 'image', 'boolean', 'json']),
  description: z.string().optional(),
})

export const heroBackgroundSchema = z.object({
  heroBackgroundImage: z.string().url('URL d\'image invalide').optional(),
})

export type SettingFormData = z.infer<typeof settingSchema>
export type HeroBackgroundFormData = z.infer<typeof heroBackgroundSchema>
