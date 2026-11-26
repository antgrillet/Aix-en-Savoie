/**
 * Gymnases où le club reçoit, avec leur adresse. Sans prisma : utilisable côté client.
 * Mêmes motifs que SALLES_DOMICILE (src/lib/resultats-weekend.ts) et la synchronisation FFHANDBALL.
 */

/** Adresse du club (gymnase des Prés Riants), utilisée quand aucun lieu de match n'est connu. */
export const ADRESSE_CLUB = '7 rue des Prés Riants, 73100 Aix-les-Bains'

const VILLE = 'Aix-les-Bains'

export interface Gymnase {
  nom: string
  /** Adresse postale ; `null` tant qu'elle n'est pas confirmée */
  adresse: string | null
}

const GYMNASES: (Gymnase & { motif: RegExp })[] = [
  { motif: /pr[eé]s?[\s-]*riants?/i, nom: 'Gymnase des Prés Riants', adresse: ADRESSE_CLUB },
  // Adresse postale à confirmer par le club : l'itinéraire vise le gymnase par son nom
  { motif: /marlioz/i, nom: 'Gymnase de Marlioz', adresse: null },
]

/** Gymnase du club reconnu dans un libellé de lieu, ou `null`. */
export function gymnaseDuClub(lieu: string | null | undefined): Gymnase | null {
  if (!lieu) return null
  const gymnase = GYMNASES.find(({ motif }) => motif.test(lieu))
  return gymnase ? { nom: gymnase.nom, adresse: gymnase.adresse } : null
}

/**
 * Destination de l'itinéraire : l'adresse du gymnase si elle est connue, sinon le lieu suivi
 * de « , Aix-les-Bains » pour que Google Maps ne cherche pas une salle homonyme ailleurs.
 */
export function destinationItineraire(lieu: string | null | undefined): string {
  const brut = lieu?.trim()
  if (!brut) return ADRESSE_CLUB
  const gymnase = gymnaseDuClub(brut)
  if (gymnase?.adresse) return gymnase.adresse
  const nom = gymnase?.nom ?? brut
  return /aix[\s-]les[\s-]bains/i.test(nom) ? nom : `${nom}, ${VILLE}`
}
