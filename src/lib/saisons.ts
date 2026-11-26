/**
 * Saisons sportives du club.
 *
 * Une saison court du 1er août au 31 juillet, heure de Paris, comme à la
 * FFHandball. Elle est désignée par son année de début : 2026 = « 2026-2027 ».
 * Module pur : la saison affichée sur le site (réglage de l'admin) vit dans
 * `saison-courante.ts`.
 */
import { minuitParis, partiesParis } from './dates'

/** Mois (1-12) où commence une saison. */
const MOIS_DEBUT = 8

/** Bornes raisonnables : un paramètre d'URL hors de cet intervalle est ignoré. */
const PREMIERE_SAISON = 2000
const DERNIERE_SAISON = 2100

/** Année de début de la saison qui contient cette date (heure de Paris). */
export function saisonDe(date: Date): number {
  const { annee, mois } = partiesParis(date)
  return mois >= MOIS_DEBUT ? annee : annee - 1
}

/** « 2026-2027 » */
export function libelleSaison(saison: number): string {
  return `${saison}-${saison + 1}`
}

/** Du 1er août minuit (inclus) au 1er août suivant minuit (exclu), heure de Paris. */
export function bornesSaison(saison: number): { debut: Date; fin: Date } {
  return {
    debut: minuitParis(saison, MOIS_DEBUT, 1),
    fin: minuitParis(saison + 1, MOIS_DEBUT, 1),
  }
}

/** Filtre Prisma sur la date d'un match pour une saison. */
export function filtreDateSaison(saison: number): { gte: Date; lt: Date } {
  const { debut, fin } = bornesSaison(saison)
  return { gte: debut, lt: fin }
}

/** Saison lue dans un paramètre (« 2025 » ou « 2025-2026 ») ; `null` si invalide. */
export function lireSaison(texte: string | null | undefined): number | null {
  if (!texte) return null
  const morceaux = /^(\d{4})(?:-(\d{4}))?$/.exec(texte.trim())
  if (!morceaux) return null
  const debut = Number(morceaux[1])
  if (morceaux[2] && Number(morceaux[2]) !== debut + 1) return null
  if (debut < PREMIERE_SAISON || debut > DERNIERE_SAISON) return null
  return debut
}

/** Saisons de la plus récente à la plus ancienne, entre deux saisons incluses. */
export function saisonsEntre(premiere: number, derniere: number): number[] {
  const saisons: number[] = []
  for (let saison = Math.max(premiere, derniere); saison >= Math.min(premiere, derniere); saison--) {
    saisons.push(saison)
  }
  return saisons
}
