import { z } from 'zod'

export const ordreSchema = z
  .array(
    z.object({
      id: z.number().int('Identifiant invalide').positive('Identifiant invalide'),
      ordre: z.number().int('Ordre invalide').min(0, 'L\'ordre doit être positif'),
    })
  )
  .min(1, 'Aucun élément à réordonner')
  .max(500, 'Trop d\'éléments à réordonner')

export type OrdreUpdates = z.infer<typeof ordreSchema>
