import { z } from 'zod'

const texteCourt = (max: number) => z.string().trim().min(1).max(max)

export const contactSchema = z.object({
  nom: texteCourt(80),
  prenom: texteCourt(80),
  email: z.string().trim().max(200).pipe(z.email()),
  telephone: z.string().trim().max(30).nullish(),
  message: z.string().trim().min(1).max(5000),
  experience: z.boolean().nullish(),
  niveau: z.string().trim().max(60).nullish(),
  positions: z.array(z.string().trim().max(40)).max(10).nullish(),
  // Champ leurre, invisible pour un visiteur : seul un robot le remplit.
  leurre: z.string().max(200).nullish(),
})

export type ContactData = z.infer<typeof contactSchema>
