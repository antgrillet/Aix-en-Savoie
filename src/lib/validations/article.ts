import { z } from 'zod'

export const articleSchema = z.object({
  titre: z.string().min(1, 'Le titre est requis').max(200),
  categorie: z.string().min(1, 'La catégorie est requise'),
  date: z.date(),
  image: z.string().url('URL d\'image invalide'),
  resume: z.string().min(10, 'Le résumé doit contenir au moins 10 caractères'),
  contenu: z.string().min(50, 'Le contenu doit contenir au moins 50 caractères'),
  vedette: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
})

export type ArticleFormData = z.infer<typeof articleSchema>
