import { prisma } from '@/lib/prisma'
import { ADRESSE_CLUB, destinationItineraire, gymnaseDuClub } from '@/lib/gymnases'

export { ADRESSE_CLUB }

/**
 * Lieu où le club reçoit le plus souvent, d'après les matchs à domicile
 * synchronisés depuis FFHANDBALL. Sans donnée exploitable : `null`.
 */
export async function getLieuDomicile(): Promise<string | null> {
  try {
    const lieux = await prisma.match.groupBy({
      by: ['lieu'],
      where: { domicile: true, lieu: { not: '' } },
      _count: { lieu: true },
      orderBy: { _count: { lieu: 'desc' } },
      take: 5,
    })
    // Les matchs pas encore programmés portent un lieu provisoire (« À déterminer »)
    const reel = lieux.find((l) => !/d[ée]termin|inconnu|^tbd$/i.test(l.lieu.trim()))
    const lieu = reel?.lieu.trim()
    if (!lieu) return null
    return gymnaseDuClub(lieu)?.nom ?? lieu
  } catch (error) {
    console.error('Lieu des matchs à domicile indisponible :', error)
    return null
  }
}

/** Lien Google Maps vers le lieu : adresse du gymnase si elle est connue, sinon le lieu à Aix-les-Bains */
export function lienItineraire(lieu: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationItineraire(lieu))}`
}
