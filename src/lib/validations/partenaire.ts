import { z } from 'zod'

export const partenaireSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100),
  categorie: z.string().min(1, 'La catégorie est requise'),
  logo: z.string().url('URL de logo invalide'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  site: z.string().url('URL invalide').optional().or(z.literal('')),
  partenaire_majeur: z.boolean().default(false),
  ordre: z.number().int().min(0),
  published: z.boolean().default(true),
})

export type PartenaireFormData = z.infer<typeof partenaireSchema>
