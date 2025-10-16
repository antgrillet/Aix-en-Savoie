import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50),
  type: z.enum(['article', 'equipe', 'partenaire']),
  slug: z.string().min(1, 'Le slug est requis').max(50),
})

export type CategoryFormData = z.infer<typeof categorySchema>
