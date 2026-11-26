import { cache } from 'react'
import { getSetting } from './settings'
import { lireSaison, saisonDe } from './saisons'

/** Clé du réglage : vide ou absent = saison calculée d'après la date. */
export const CLE_SAISON_AFFICHEE = 'saison_affichee'

/** Saison calculée d'après la date du jour (bascule le 1er août). */
export function saisonAutomatique(maintenant = new Date()): number {
  return saisonDe(maintenant)
}

/**
 * Saison que le site public affiche. Par défaut celle du calendrier ;
 * l'admin peut la fixer (par exemple pour ouvrir la nouvelle saison en juillet,
 * dès que les calendriers sont publiés).
 */
export const getSaisonAffichee = cache(async (): Promise<number> => {
  const reglage = await getSetting(CLE_SAISON_AFFICHEE)
  return lireSaison(reglage?.value) ?? saisonAutomatique()
})

/** Le réglage brut : `null` en mode automatique. */
export async function getSaisonFixee(): Promise<number | null> {
  const reglage = await getSetting(CLE_SAISON_AFFICHEE)
  return lireSaison(reglage?.value)
}
