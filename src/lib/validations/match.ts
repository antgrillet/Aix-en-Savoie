import { z } from 'zod'
import { lireChampDateHeure } from '@/lib/dates'

const score = z
  .number({ error: 'Le score est un nombre entier' })
  .int('Le score est un nombre entier')
  .min(0, 'Le score ne peut pas être négatif')
  .max(99, 'Le score ne peut pas dépasser 99')
  .nullable()

export const matchSchema = z.object({
  equipeId: z.number({ error: 'Équipe invalide' }).int('Équipe invalide').positive('Équipe invalide'),
  adversaire: z.string().trim().min(1, 'L\'adversaire est requis').max(120),
  date: z.date({ error: 'Date du match invalide' }),
  lieu: z.string().trim().min(1, 'Le lieu est requis').max(200),
  domicile: z.boolean(),
  competition: z
    .string()
    .trim()
    .transform((valeur) => valeur || null),
  termine: z.boolean(),
  scoreEquipe: score,
  scoreAdversaire: score,
  published: z.boolean(),
})

export type MatchFormData = z.infer<typeof matchSchema>

/** Lit le formulaire d'un match (heure saisie à Paris) et le valide. */
export function lireMatchFormData(formData: FormData): MatchFormData {
  const texte = (nom: string) => {
    const valeur = formData.get(nom)
    return typeof valeur === 'string' ? valeur : ''
  }
  const termine = texte('termine') === 'true'
  // Un score n'est lu que pour un match terminé ; un champ vide reste sans score.
  const lireScore = (nom: string) => {
    const valeur = texte(nom).trim()
    return termine && valeur !== '' ? Number(valeur) : null
  }

  return matchSchema.parse({
    equipeId: Number(texte('equipeId')),
    adversaire: texte('adversaire'),
    date: lireChampDateHeure(texte('date')),
    lieu: texte('lieu'),
    domicile: texte('domicile') === 'true',
    competition: texte('competition'),
    termine,
    scoreEquipe: lireScore('scoreEquipe'),
    scoreAdversaire: lireScore('scoreAdversaire'),
    published: texte('published') === 'true',
  })
}
