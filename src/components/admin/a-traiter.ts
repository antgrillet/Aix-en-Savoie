import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { AdminCounts } from './navigation'

/**
 * Ce qui attend une action dans l'admin. Lectures seules, toutes tirées du
 * schéma : aucun chiffre n'est estimé.
 */
export interface ATraiter {
  /** Messages de contact ni lus ni archivés (même définition que l'onglet « Non lus ») */
  messagesNonLus: number
  /** Articles non publiés */
  brouillons: number
  /** Matchs publiés joués ces 30 derniers jours, non terminés et sans score */
  scoresEnAttente: number
  /** Équipes publiées sans lien de championnat FFHANDBALL (synchronisation impossible) */
  equipesSansLien: number
  /** Noms de ces équipes, pour dire lesquelles */
  equipesSansLienNoms: string[]
  /** Notes d'arbitrage à valider, ou validées mais pas encore parties chez le comptable */
  notesArbitrage: number
  /** Dépôt de la plus ancienne de ces notes */
  plusAncienneNoteArbitrage: Date | null
  /** Échéances : de quoi classer les tâches par urgence */
  echeances: {
    /** Plus ancien message non lu */
    plusAncienMessage: Date | null
    /** Plus ancien match joué encore sans score */
    plusAncienScore: Date | null
  }
}

/**
 * Matchs publiés joués ces 30 derniers jours, non terminés et sans score. Au-delà
 * de 30 jours, un score manquant n'est plus une tâche : les matchs des saisons
 * passées restent sans résultat pour de bon. Partagé avec l'écran Résultats.
 */
export function filtreScoresEnAttente(maintenant: Date) {
  return {
    published: true,
    termine: false,
    date: { lt: maintenant, gte: new Date(maintenant.getTime() - 30 * 24 * 60 * 60 * 1000) },
    OR: [{ scoreEquipe: null }, { scoreAdversaire: null }],
  }
}

/**
 * Mis en cache pour la durée de la requête : le layout (compteurs du rail) et
 * le tableau de bord (zone « À traiter ») partagent les mêmes lectures.
 */
export const getATraiter = cache(async (): Promise<ATraiter> => {
  const maintenant = new Date()

  const filtreMessages = { read: false, archived: false }
  const filtreScores = filtreScoresEnAttente(maintenant)

  const [messages, brouillons, scores, equipesSansLien, notesArbitrage] = await Promise.all([
    prisma.contactMessage.aggregate({
      where: filtreMessages,
      _count: { _all: true },
      _min: { createdAt: true },
    }),
    prisma.article.count({ where: { published: false } }),
    prisma.match.aggregate({ where: filtreScores, _count: { _all: true }, _min: { date: true } }),
    prisma.equipe.findMany({
      where: { published: true, OR: [{ matches: null }, { matches: '' }] },
      orderBy: { ordre: 'asc' },
      select: { nom: true },
    }),
    prisma.noteArbitrage.aggregate({
      where: { OR: [{ statut: 'EN_ATTENTE' }, { statut: 'VALIDEE', envoiComptableLe: null }] },
      _count: { _all: true },
      _min: { createdAt: true },
    }),
  ])

  return {
    messagesNonLus: messages._count._all,
    brouillons,
    scoresEnAttente: scores._count._all,
    equipesSansLien: equipesSansLien.length,
    equipesSansLienNoms: equipesSansLien.map((equipe) => equipe.nom),
    notesArbitrage: notesArbitrage._count._all,
    plusAncienneNoteArbitrage: notesArbitrage._min.createdAt,
    echeances: {
      plusAncienMessage: messages._min.createdAt,
      plusAncienScore: scores._min.date,
    },
  }
})

/** Les compteurs « à traiter » du rail et de la barre d'onglets. */
export function compteursParSection(aTraiter: ATraiter): AdminCounts {
  return {
    articles: aTraiter.brouillons,
    equipes: aTraiter.equipesSansLien,
    resultats: aTraiter.scoresEnAttente,
    messages: aTraiter.messagesNonLus,
    arbitrage: aTraiter.notesArbitrage,
  }
}
