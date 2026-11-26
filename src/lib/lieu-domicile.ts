import { prisma } from '@/lib/prisma'

/** Adresse du club, utilisée quand aucun lieu de match n'est connu. */
export const ADRESSE_CLUB = '7 rue des Prés Riants, 73100 Aix-les-Bains'

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
    return reel?.lieu.trim() || null
  } catch (error) {
    console.error('Lieu des matchs à domicile indisponible :', error)
    return null
  }
}

export function lienItineraire(destination: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}
