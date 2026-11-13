/**
 * Règles de l'espace bénévoles : quels matchs restent ouverts aux inscriptions
 * et combien de bénévoles chaque rôle accepte.
 *
 * Module pur : pas de Prisma, pas de Next, pas de fuseau horaire. La règle de
 * date compare des instants.
 */
import type { RoleInscription } from '@/generated/prisma/enums'

// Un match reste visible et ouvert trois heures après le coup d'envoi, pour que
// le match du jour reste accessible pendant qu'il se joue.
export const DELAI_APRES_COUP_ENVOI_MS = 3 * 60 * 60 * 1000

export function limiteMatchsOuverts(maintenant: Date): Date {
  return new Date(maintenant.getTime() - DELAI_APRES_COUP_ENVOI_MS)
}

export function matchOuvert(match: { date: Date; termine: boolean }, maintenant: Date): boolean {
  return !match.termine && match.date.getTime() >= limiteMatchsOuverts(maintenant).getTime()
}

// Quotas maximum par rôle
export const QUOTAS: Record<RoleInscription, number | null> = {
  TABLE_DE_MARQUE: 2,
  ARBITRE: 2,
  RESPONSABLE_SALLE: 1,
  BUVETTE: null, // Illimité
}

export function placeDisponible(role: RoleInscription, dejaInscrits: number): boolean {
  const quota = QUOTAS[role]
  return quota === null || dejaInscrits < quota
}
