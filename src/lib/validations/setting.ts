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

// Pages publiques qui lisent `${page}_background_image` (legal : mentions légales et politique de confidentialité)
export const PAGES_AVEC_FOND = ['partenaires', 'actus', 'equipes', 'contact', 'legal'] as const

export const pageAvecFondSchema = z.enum(PAGES_AVEC_FOND)

export const imageDeFondSchema = z.string().url('URL d\'image invalide')

export type SettingFormData = z.infer<typeof settingSchema>
export type HeroBackgroundFormData = z.infer<typeof heroBackgroundSchema>
