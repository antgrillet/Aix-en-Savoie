import { z } from 'zod'

const entrainementSchema = z.object({
  jour: z.string().min(1, 'Le jour est requis'),
  horaire: z.string().min(1, 'L\'horaire est requis'),
  lieu: z.string().optional(),
})

export const equipeSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis').max(100),
  categorie: z.string().min(1, 'La catégorie est requise'),
  genre: z.enum(['MASCULIN', 'FEMININ'], { message: 'Le genre est requis' }),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  entraineur: z.string().min(1, 'Le nom de l\'entraîneur est requis'),
  matches: z.string().optional(),
  photo: z.string().url('URL de photo invalide'),
  banniere: z.string().url('URL de bannière invalide').optional().or(z.literal('')),
  ordre: z.number().int().min(0),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  entrainements: z.array(entrainementSchema).default([]),
})

export type EquipeFormData = z.infer<typeof equipeSchema>
export type EntrainementFormData = z.infer<typeof entrainementSchema>
