import { z } from 'zod'
import {
  ANCIENNETE_MAX_JOURS,
  MAX_BAREME_KM_CENTIMES,
  MAX_FRAIS_ANNEXES_CENTIMES,
  MAX_INDEMNITE_CENTIMES,
  MAX_KILOMETRES,
  MAX_TAILLE_SIGNATURE,
  aujourdhuiParis,
  bicValide,
  decalerJour,
  eurosEnCentimes,
  ibanValide,
  jourValide,
  nettoyerIban,
} from '@/lib/arbitrage'

const texte = (max: number, message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(max, `${max} caractères au plus.`)
    // Un retour à la ligne n'a rien à faire dans un champ court (en-têtes de mail, PDF)
    .transform((valeur) => valeur.replace(/[\r\n\t]+/g, ' '))

const texteFacultatif = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max} caractères au plus.`)
    .transform((valeur) => valeur.replace(/[\r\n\t]+/g, ' '))

/** Un montant saisi en euros (« 12,50 »), rendu en centimes entiers et borné. */
const euros = (max: number, libelle: string) =>
  z.string().transform((saisie, ctx) => {
    const centimes = eurosEnCentimes(saisie)
    if (centimes === null) {
      ctx.addIssue({ code: 'custom', message: `${libelle} : un montant en euros, par exemple 12,50.` })
      return z.NEVER
    }
    if (centimes > max) {
      ctx.addIssue({ code: 'custom', message: `${libelle} : ${max / 100} € au plus.` })
      return z.NEVER
    }
    return centimes
  })

const kilometres = z.string().transform((saisie, ctx) => {
  const valeur = saisie.trim()
  if (valeur === '') return 0
  if (!/^\d{1,4}$/.test(valeur) || Number(valeur) > MAX_KILOMETRES) {
    ctx.addIssue({ code: 'custom', message: `Un nombre entier de kilomètres, ${MAX_KILOMETRES} au plus.` })
    return z.NEVER
  }
  return Number(valeur)
})

/** Ce que l'arbitre envoie depuis la page publique. */
export const noteArbitrageSchema = z
  .object({
    dateMatch: z.string().refine(jourValide, 'Indiquez la date du match.'),
    heureMatch: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Indiquez l'heure du match."),
    categorie: texte(80, 'Indiquez la catégorie ou la compétition.'),
    equipeLocale: texte(120, "Indiquez l'équipe qui reçoit."),
    equipeVisiteur: texte(120, "Indiquez l'équipe visiteuse."),
    salle: texte(160, 'Indiquez le gymnase.'),

    nom: texte(80, 'Indiquez votre nom.').transform((v) => v.toUpperCase()),
    prenom: texte(80, 'Indiquez votre prénom.'),
    licence: texte(30, 'Indiquez votre numéro de licence FFHandball.'),
    adresse: texte(250, 'Indiquez votre adresse, point de départ du trajet.'),
    telephone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s.()-]{6,25}$/, 'Indiquez un numéro de téléphone valide.'),
    email: z.string().trim().max(200).pipe(z.email('Indiquez une adresse e-mail valide.')),

    titulaireCompte: texteFacultatif(120),
    iban: z
      .string()
      .max(50)
      .transform(nettoyerIban)
      .refine((v) => v === '' || ibanValide(v), "L'IBAN n'est pas valide : vérifiez-le, ou laissez le champ vide."),
    bic: z
      .string()
      .max(20)
      .transform((v) => v.trim().toUpperCase())
      .refine((v) => v === '' || bicValide(v), "Le BIC n'est pas valide (8 ou 11 caractères)."),

    indemnite: euros(MAX_INDEMNITE_CENTIMES, "L'indemnité"),
    kilometres,
    fraisAnnexes: euros(MAX_FRAIS_ANNEXES_CENTIMES, 'Les frais de péage et parking'),

    certification: z.literal(true, { error: 'Cochez la déclaration sur l’honneur.' }),
    // Champ leurre, invisible pour un visiteur : seul un robot le remplit.
    leurre: z.string().max(200).optional(),
  })
  .superRefine((note, ctx) => {
    const aujourdhui = aujourdhuiParis()
    if (note.dateMatch > aujourdhui) {
      ctx.addIssue({ code: 'custom', path: ['dateMatch'], message: 'Le match doit déjà avoir été joué.' })
    } else if (note.dateMatch < decalerJour(aujourdhui, -ANCIENNETE_MAX_JOURS)) {
      ctx.addIssue({ code: 'custom', path: ['dateMatch'], message: 'Le match date de plus d’un an.' })
    }
    if (note.iban !== '' && note.titulaireCompte === '') {
      ctx.addIssue({ code: 'custom', path: ['titulaireCompte'], message: 'Indiquez le titulaire du compte.' })
    }
    if (note.indemnite + note.kilometres + note.fraisAnnexes === 0) {
      ctx.addIssue({ code: 'custom', path: ['indemnite'], message: 'La note ne demande aucun montant.' })
    }
  })

export type NoteArbitrageSaisie = z.input<typeof noteArbitrageSchema>
export type NoteArbitrageValidee = z.output<typeof noteArbitrageSchema>

/** Frais ajustés par le bureau à la validation. */
const fraisBureau = {
  indemnite: euros(MAX_INDEMNITE_CENTIMES, "L'indemnité"),
  kilometres,
  bareme: z.string().transform((saisie, ctx) => {
    const centimes = eurosEnCentimes(saisie)
    if (centimes === null || centimes > MAX_BAREME_KM_CENTIMES) {
      ctx.addIssue({ code: 'custom', message: 'Un barème en euros par kilomètre, par exemple 0,32.' })
      return z.NEVER
    }
    return centimes
  }),
  fraisAnnexes: euros(MAX_FRAIS_ANNEXES_CENTIMES, 'Les frais de péage et parking'),
}

export const validationNoteSchema = z
  .object({
    id: z.number().int().positive(),
    ...fraisBureau,
    validateur: texte(120, 'Indiquez votre nom.'),
    commentaire: z.string().trim().max(1000, '1 000 caractères au plus.'),
    certification: z.literal(true, { error: 'Cochez la certification.' }),
    signature: z
      .string()
      .startsWith('data:image/png;base64,', 'Signez dans le cadre.')
      .max(Math.ceil((MAX_TAILLE_SIGNATURE * 4) / 3) + 30, 'La signature est trop lourde : effacez et recommencez.'),
  })
  .superRefine((note, ctx) => {
    if (note.indemnite + note.kilometres * note.bareme + note.fraisAnnexes === 0) {
      ctx.addIssue({ code: 'custom', path: ['indemnite'], message: 'La note ne demande aucun montant.' })
    }
  })

export type ValidationNoteSaisie = z.input<typeof validationNoteSchema>

export const refusNoteSchema = z.object({
  id: z.number().int().positive(),
  motif: z.string().trim().min(5, 'Expliquez le refus en quelques mots.').max(1000, '1 000 caractères au plus.'),
})

export const reglagesArbitrageSchema = z.object({
  emailComptable: z.string().trim().max(200).pipe(z.email('Indiquez une adresse e-mail valide.')),
  bareme: fraisBureau.bareme.refine((c) => c > 0, 'Le barème doit être supérieur à 0.'),
})
