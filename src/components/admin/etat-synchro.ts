import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { StatusTone } from './StatusMark'
import { ilYa, pluriel } from './temps'

/** Au-delà, la synchro automatique (au moins une fois par jour) a manqué un passage. */
const SYNCHRO_ANCIENNE_MS = 30 * 60 * 60 * 1000
/** Les journaux d'un même passage s'écrivent à quelques minutes d'écart. */
const DUREE_PASSAGE_MS = 30 * 60 * 1000

export interface LigneJournal {
  id: number
  date: Date
  equipe: string
  status: string
  message: string
  crees: number
  modifies: number
  inchanges: number
}

export interface EtatSynchro {
  /** Date du dernier journal, toutes équipes confondues */
  derniere: Date | null
  tone: StatusTone
  /** Texte court de l'en-tête : « synchro il y a 2 h » */
  libelle: string
  /** Phrase complète (infobulle, lecteur d'écran) */
  detail: string
  /** Le dernier passage : un journal par équipe */
  passage: {
    equipes: number
    erreurs: number
    avertissements: number
    lus: number
    modifies: number
  }
  /** Les 30 derniers journaux, du plus récent au plus ancien */
  journal: LigneJournal[]
}

/**
 * État de la synchronisation FFHandball, lu dans `SyncLog`. Mis en cache pour
 * la requête : l'en-tête et le tableau de bord partagent la même lecture.
 */
export const getEtatSynchro = cache(async (): Promise<EtatSynchro> => {
  const maintenant = new Date()
  const logs = await prisma.syncLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 60,
    select: {
      id: true,
      createdAt: true,
      status: true,
      message: true,
      matchesCreated: true,
      matchesUpdated: true,
      matchesSkipped: true,
      equipe: { select: { nom: true } },
    },
  })

  const journal: LigneJournal[] = logs.map((log) => ({
    id: log.id,
    date: log.createdAt,
    equipe: log.equipe.nom,
    status: log.status,
    message: log.message,
    crees: log.matchesCreated,
    modifies: log.matchesUpdated,
    inchanges: log.matchesSkipped,
  }))

  const derniere = journal[0]?.date ?? null
  if (!derniere) {
    return {
      derniere: null,
      tone: 'neutral',
      libelle: 'jamais synchronisé',
      detail: 'Aucune synchronisation FFHandball enregistrée.',
      passage: { equipes: 0, erreurs: 0, avertissements: 0, lus: 0, modifies: 0 },
      journal: [],
    }
  }

  // Le dernier passage : une seule ligne par équipe, la plus récente
  const vues = new Set<string>()
  const lignesPassage = journal.filter((ligne) => {
    if (derniere.getTime() - ligne.date.getTime() > DUREE_PASSAGE_MS) return false
    if (vues.has(ligne.equipe)) return false
    vues.add(ligne.equipe)
    return true
  })
  const passage = {
    equipes: lignesPassage.length,
    erreurs: lignesPassage.filter((ligne) => ligne.status === 'error').length,
    avertissements: lignesPassage.filter((ligne) => ligne.status === 'warning').length,
    lus: lignesPassage.reduce((somme, l) => somme + l.crees + l.modifies + l.inchanges, 0),
    modifies: lignesPassage.reduce((somme, l) => somme + l.crees + l.modifies, 0),
  }

  const quand = ilYa(derniere, maintenant)
  const ancienne = maintenant.getTime() - derniere.getTime() > SYNCHRO_ANCIENNE_MS

  let tone: StatusTone = 'ok'
  let suite = ''
  if (passage.erreurs > 0) {
    tone = 'bad'
    suite = ` · ${passage.erreurs} ${pluriel(passage.erreurs, 'équipe en erreur', 'équipes en erreur')}`
  } else if (ancienne) {
    tone = 'warn'
    suite = ' · en retard'
  }

  return {
    derniere,
    tone,
    libelle: `synchro ${quand}${suite}`,
    detail: `Dernière synchronisation FFHandball ${quand}${suite}.`,
    passage,
    journal: journal.slice(0, 30),
  }
})
