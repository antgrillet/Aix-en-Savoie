import type { ATraiter } from './a-traiter'
import type { StatusTone } from './StatusMark'
import { echeance, formatJourCourt, ilYa, pluriel } from './temps'

const HEURE = 60 * 60 * 1000
const JOUR = 24 * HEURE

/** Délai laissé à la fédération pour publier un score avant de le saisir soi-même. */
export const DELAI_SCORE = 2 * JOUR
/** Au-delà, un message sans réponse devient une tâche à traiter. */
export const DELAI_MESSAGE = 7 * JOUR
/** Au-delà, une note d'arbitrage en souffrance retarde le paiement de l'arbitre. */
export const DELAI_NOTE_ARBITRAGE = 7 * JOUR

export interface Urgence {
  id: 'equipes' | 'scores' | 'messages' | 'arbitrage' | 'brouillons'
  nombre: number
  libelle: string
  detail: string
  href: string
  /** Échéance dite en clair, avec sa couleur */
  echeance: { texte: string; tone: StatusTone }
  /** Empêche une autre tâche de se faire (rouge) */
  bloquant?: boolean
  /** L'échéance est proche ou dépassée (orange) */
  urgent?: boolean
  /** Clé de tri : la date à laquelle la tâche devient un problème */
  rang: number
}

/**
 * Ce qui attend une action, classé par échéance : le bloquant d'abord, puis la
 * date à laquelle chaque tâche devient un problème, le sans-échéance en dernier.
 */
export function classerUrgences(aTraiter: ATraiter, maintenant: Date): Urgence[] {
  const t = maintenant.getTime()
  const urgences: Urgence[] = []
  const { echeances } = aTraiter

  if (aTraiter.equipesSansLien > 0) {
    const noms = aTraiter.equipesSansLienNoms
    urgences.push({
      id: 'equipes',
      nombre: aTraiter.equipesSansLien,
      libelle: pluriel(aTraiter.equipesSansLien, 'équipe sans lien FFHandball', 'équipes sans lien FFHandball'),
      detail: `Ses matchs ne se synchronisent pas${noms.length > 0 ? ` : ${noms.slice(0, 3).join(', ')}${noms.length > 3 ? '…' : ''}` : ''}.`,
      href: '/admin/equipes',
      echeance: { texte: 'Bloquant', tone: 'bad' },
      bloquant: true,
      rang: Number.NEGATIVE_INFINITY,
    })
  }

  if (aTraiter.scoresEnAttente > 0) {
    const date = echeances.plusAncienScore
    const enRetard = date !== null && t - date.getTime() > DELAI_SCORE
    urgences.push({
      id: 'scores',
      nombre: aTraiter.scoresEnAttente,
      libelle: pluriel(aTraiter.scoresEnAttente, 'score en attente', 'scores en attente'),
      detail: 'Matchs joués sans résultat : relancez la synchro ou saisissez le score.',
      href: '/admin/resultats?filtre=sans-score',
      echeance: date
        ? {
            texte: enRetard ? `En attente depuis ${formatJourCourt(date)}` : `Joué ${ilYa(date, maintenant)}`,
            tone: enRetard ? 'action' : 'neutral',
          }
        : { texte: 'À saisir', tone: 'neutral' },
      urgent: enRetard,
      rang: date ? date.getTime() + DELAI_SCORE : t,
    })
  }

  if (aTraiter.messagesNonLus > 0) {
    const date = echeances.plusAncienMessage
    const ancien = date !== null && t - date.getTime() > DELAI_MESSAGE
    urgences.push({
      id: 'messages',
      nombre: aTraiter.messagesNonLus,
      libelle: pluriel(aTraiter.messagesNonLus, 'message non lu', 'messages non lus'),
      detail: 'Reçus par le formulaire de contact du site.',
      href: '/admin/messages',
      echeance: date
        ? { texte: `Plus ancien : ${ilYa(date, maintenant)}`, tone: ancien ? 'action' : 'neutral' }
        : { texte: 'À lire', tone: 'neutral' },
      urgent: false,
      rang: date ? date.getTime() + DELAI_MESSAGE : t + DELAI_MESSAGE,
    })
  }

  if (aTraiter.notesArbitrage > 0) {
    const date = aTraiter.plusAncienneNoteArbitrage
    const ancienne = date !== null && t - date.getTime() > DELAI_NOTE_ARBITRAGE
    urgences.push({
      id: 'arbitrage',
      nombre: aTraiter.notesArbitrage,
      libelle: pluriel(aTraiter.notesArbitrage, "note d'arbitrage à traiter", "notes d'arbitrage à traiter"),
      detail: 'À valider par le bureau puis envoyer au comptable.',
      href: '/admin/arbitrage',
      echeance: date
        ? { texte: `Déposée ${ilYa(date, maintenant)}`, tone: ancienne ? 'action' : 'neutral' }
        : { texte: 'À valider', tone: 'neutral' },
      urgent: ancienne,
      rang: date ? date.getTime() + DELAI_NOTE_ARBITRAGE : t + DELAI_NOTE_ARBITRAGE,
    })
  }

  if (aTraiter.brouillons > 0) {
    urgences.push({
      id: 'brouillons',
      nombre: aTraiter.brouillons,
      libelle: pluriel(aTraiter.brouillons, 'article en brouillon', 'articles en brouillon'),
      detail: 'Écrits, pas encore visibles sur le site.',
      href: '/admin/articles?statut=draft',
      echeance: { texte: 'Sans échéance', tone: 'neutral' },
      rang: Number.POSITIVE_INFINITY,
    })
  }

  return urgences.sort((a, b) => a.rang - b.rang)
}
