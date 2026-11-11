import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import { getInscriptionsStats } from '@/app/(admin)/admin/inscriptions/actions'
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
  /** Postes de bénévoles manquants sur les matchs à domicile à venir */
  postesAPourvoir: number
  /** Nombre de matchs à domicile à venir concernés par ces postes */
  matchsARenforcer: number
  /** Équipes publiées sans lien de championnat FFHANDBALL (synchronisation impossible) */
  equipesSansLien: number
}

/**
 * Mis en cache pour la durée de la requête : le layout (compteurs du rail) et
 * le tableau de bord (zone « À traiter ») partagent les mêmes lectures.
 */
export const getATraiter = cache(async (): Promise<ATraiter> => {
  const maintenant = new Date()
  const ilYA30Jours = new Date(maintenant.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [messagesNonLus, brouillons, scoresEnAttente, equipesSansLien, matchsAvecManques] =
    await Promise.all([
      prisma.contactMessage.count({ where: { read: false, archived: false } }),
      prisma.article.count({ where: { published: false } }),
      prisma.match.count({
        where: {
          published: true,
          termine: false,
          // Au-delà de 30 jours, un score manquant n'est plus une tâche :
          // les matchs des saisons passées restent sans résultat pour de bon.
          date: { lt: maintenant, gte: ilYA30Jours },
          OR: [{ scoreEquipe: null }, { scoreAdversaire: null }],
        },
      }),
      prisma.equipe.count({
        where: { published: true, OR: [{ matches: null }, { matches: '' }] },
      }),
      // Règle métier des besoins en bénévoles : celle de la section Inscriptions
      getInscriptionsStats(),
    ])

  const aVenir = matchsAvecManques.filter(
    (match) => new Date(match.date).getTime() >= maintenant.getTime()
  )

  return {
    messagesNonLus,
    brouillons,
    scoresEnAttente,
    postesAPourvoir: aVenir.reduce((somme, match) => somme + match.totalManques, 0),
    matchsARenforcer: aVenir.length,
    equipesSansLien,
  }
})

/** Les compteurs « à traiter » du rail et de la barre d'onglets. */
export function compteursParSection(aTraiter: ATraiter): AdminCounts {
  return {
    articles: aTraiter.brouillons,
    equipes: aTraiter.equipesSansLien,
    resultats: aTraiter.scoresEnAttente,
    inscriptions: aTraiter.postesAPourvoir,
    messages: aTraiter.messagesNonLus,
  }
}
