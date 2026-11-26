import { getEtendueSaisons } from '@/app/(admin)/admin/matchs/actions'
import { getSaisonAffichee, saisonAutomatique } from '@/lib/saison-courante'
import { libelleSaison, saisonsEntre } from '@/lib/saisons'

export interface SaisonMenu {
  saison: number
  libelle: string
  /** « affichée sur le site », « archivée », « à venir » */
  etat: string
}

export interface SaisonsAdmin {
  affichee: number
  /** De la plus récente à la plus ancienne */
  saisons: SaisonMenu[]
  /** Saison suivante, à préparer depuis Paramètres ; `null` si elle est déjà affichée */
  suivante: number | null
}

/** Les saisons du sélecteur d'en-tête : celles qui ont des matchs, et la saison affichée. */
export async function getSaisonsAdmin(): Promise<SaisonsAdmin> {
  const [affichee, etendue] = await Promise.all([getSaisonAffichee(), getEtendueSaisons()])
  const liste = etendue
    ? saisonsEntre(Math.min(etendue.premiere, affichee), Math.max(etendue.derniere, affichee))
    : [affichee]

  return {
    affichee,
    saisons: liste.map((saison) => ({
      saison,
      libelle: libelleSaison(saison),
      etat: saison === affichee ? 'affichée sur le site' : saison > affichee ? 'à venir' : 'archivée',
    })),
    suivante: affichee >= saisonAutomatique() + 1 ? null : affichee + 1,
  }
}
