import { prisma } from '@/lib/prisma'
import { bornesSemaine } from '@/lib/resultats-weekend'
import { composerWeekend, estDuWeekend, estEquipePlateau, type CompositionWeekend, type Gabarit } from './composition'

export const GABARITS: Gabarit[] = ['planning', 'resultat']

export function lireGabarit(valeur: string | null | undefined): Gabarit | null {
  return GABARITS.find((gabarit) => gabarit === valeur) ?? null
}

/** Matchs publiés du week-end des équipes publiées, mis en forme pour les visuels. */
export async function chargerWeekend(lundi: string, gabarit: Gabarit): Promise<CompositionWeekend> {
  const { debut, fin } = bornesSemaine(lundi)
  const matchs = await prisma.match.findMany({
    where: { date: { gte: debut, lt: fin }, published: true, equipe: { published: true } },
    orderBy: { date: 'asc' },
    select: {
      id: true,
      adversaire: true,
      date: true,
      lieu: true,
      domicile: true,
      scoreEquipe: true,
      scoreAdversaire: true,
      termine: true,
      logoAdversaire: true,
      equipe: { select: { id: true, nom: true, categorie: true, ordre: true } },
    },
  })
  return composerWeekend(matchs, lundi, gabarit)
}

/** Identifiant de page dans l'adresse : « couverture », « domicile-1 », « exterieur-2 »… */
export function idPage(page: { cote: string; numero: number }): string {
  return `${page.cote}-${page.numero}`
}

/**
 * Matchs du samedi et du dimanche pouvant avoir une affiche Game Day (titre « Week-end du … ») :
 * hors plateaux, seniors d'abord.
 */
export async function matchsGameDay(lundi: string) {
  const { debut, fin } = bornesSemaine(lundi)
  const matchs = await prisma.match.findMany({
    where: { date: { gte: debut, lt: fin }, published: true, equipe: { published: true } },
    orderBy: { date: 'asc' },
    select: selectGameDay,
  })
  return matchs
    .filter((match) => estDuWeekend(match.date, lundi) && !estEquipePlateau(match.equipe))
    .sort((a, b) => Number(estSenior(b.equipe.nom)) - Number(estSenior(a.equipe.nom)) || a.equipe.ordre - b.equipe.ordre)
}

export function chargerMatchGameDay(id: number) {
  return prisma.match.findFirst({ where: { id, published: true, equipe: { published: true } }, select: selectGameDay })
}

const selectGameDay = {
  id: true,
  adversaire: true,
  date: true,
  lieu: true,
  domicile: true,
  competition: true,
  logoAdversaire: true,
  equipe: { select: { nom: true, categorie: true, ordre: true, photo: true, banniere: true } },
} as const

function estSenior(nom: string) {
  return /^SENIOR/i.test(nom.trim())
}
