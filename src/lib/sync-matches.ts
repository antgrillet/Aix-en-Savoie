import { prisma } from './prisma'
import { chargerCalendrierEquipe, chargerSalle, pause } from './ffhandball/client'
import {
  LIEU_INCONNU,
  cleEquipe,
  trouverExistant,
  validerSalle,
  versMatch,
  type RencontreFfhb,
  type SalleFfhb,
} from './ffhandball/donnees'
import { estCategoriePlateau } from './resultats-weekend'

export interface SyncResult {
  equipeId: number
  equipeNom: string
  status: 'success' | 'error'
  message: string
  matchesCreated: number
  matchesUpdated: number
  matchesSkipped: number
  classementUpdated: number
  /** Matchs en base, sur la période couverte, que la fédération ne liste plus. */
  orphelins: string[]
}

// ============================================
// Salles : la fédération ne donne la salle que sur la page détail d'un match.
// On garde donc en base ce qu'on a déjà lu, par identifiant de salle.
// ============================================

const CLE_SALLES = 'ffhb_salles'

export type CacheSalles = {
  salles: Map<string, SalleFfhb>
  modifie: boolean
}

export async function chargerCacheSalles(): Promise<CacheSalles> {
  const salles = new Map<string, SalleFfhb>()
  const reglage = await prisma.setting.findUnique({ where: { key: CLE_SALLES } })
  if (reglage) {
    try {
      const contenu: unknown = JSON.parse(reglage.value)
      if (contenu && typeof contenu === 'object') {
        for (const [id, brute] of Object.entries(contenu as Record<string, unknown>)) {
          const salle = validerSalle(brute)
          if (salle && salle.id === id) salles.set(id, salle)
        }
      }
    } catch {
      // Cache illisible : il sera reconstruit
    }
  }
  return { salles, modifie: false }
}

export async function enregistrerCacheSalles(cache: CacheSalles): Promise<void> {
  if (!cache.modifie) return
  const value = JSON.stringify(Object.fromEntries(cache.salles))
  await prisma.setting.upsert({
    where: { key: CLE_SALLES },
    update: { value },
    create: {
      key: CLE_SALLES,
      value,
      type: 'json',
      description: 'Salles FFHandball déjà lues (cache de la synchronisation des matchs)',
    },
  })
  cache.modifie = false
}

async function trouverSalle(
  rencontre: RencontreFfhb,
  racine: string,
  cache: CacheSalles
): Promise<SalleFfhb | null> {
  if (!rencontre.equipementId) return null
  const connue = cache.salles.get(rencontre.equipementId)
  if (connue) return connue
  if (!rencontre.extPouleId) return null

  try {
    await pause()
    const salle = await chargerSalle(racine, rencontre.extPouleId, rencontre.extRencontreId)
    // On ne mémorise que si la page détail confirme l'identifiant de la liste
    if (salle && salle.id === rencontre.equipementId) {
      cache.salles.set(rencontre.equipementId, salle)
      cache.modifie = true
    }
    return salle
  } catch (erreur) {
    console.warn(`  ⚠️  Salle introuvable pour ${rencontre.adversaire}:`, erreur)
    return null
  }
}

// ============================================
// Synchronisation d'une équipe
// ============================================

const UN_JOUR = 24 * 60 * 60 * 1000

/**
 * Synchronise les matchs et le classement d'une équipe depuis FFHandball.
 * Sans `cache`, les salles sont chargées et enregistrées par l'appel lui-même.
 */
export async function syncTeamMatches(
  equipeId: number,
  equipeNom: string,
  calendrierUrl: string,
  categorie?: string,
  cache?: CacheSalles
): Promise<SyncResult> {
  let matchesCreated = 0
  let matchesUpdated = 0
  let matchesSkipped = 0
  const cacheSalles = cache ?? (await chargerCacheSalles())

  try {
    console.log(`🔄 Synchronisation de ${equipeNom}...`)

    const plateau = categorie ? estCategoriePlateau(categorie) : false
    const calendrier = await chargerCalendrierEquipe(calendrierUrl)
    const datees = calendrier.rencontres.filter(
      (rencontre): rencontre is RencontreFfhb & { date: Date } => rencontre.date !== null
    )
    console.log(
      `  ℹ️  ${calendrier.equipe.libelle} — ${datees.length} matchs datés sur ${calendrier.rencontres.length}`
    )

    const orphelins: string[] = []

    if (datees.length > 0) {
      const debut = Math.min(...datees.map((rencontre) => rencontre.date.getTime()))
      const fin = Math.max(...datees.map((rencontre) => rencontre.date.getTime()))
      const existants = await prisma.match.findMany({
        where: {
          equipeId,
          date: { gte: new Date(debut - UN_JOUR), lte: new Date(fin + UN_JOUR) },
        },
      })
      const associes = new Set<number>()

      for (const rencontre of datees) {
        const salle = await trouverSalle(rencontre, calendrier.racine, cacheSalles)
        const match = versMatch(rencontre, salle, calendrier.competition, plateau)
        const existant = trouverExistant(existants, match, associes)

        const { domicileFiable, competition, ...champs } = match

        if (!existant) {
          await prisma.match.create({
            data: { equipeId, ...champs, competition: competition ?? 'Championnat', published: true },
          })
          matchesCreated++
          console.log(`  ➕ Match créé: ${match.adversaire}`)
          continue
        }

        associes.add(existant.id)
        const data: Parameters<typeof prisma.match.update>[0]['data'] = {}
        if (existant.adversaire !== match.adversaire) data.adversaire = match.adversaire
        if (existant.date.getTime() !== match.date.getTime()) data.date = match.date
        // Un domicile de repli (plateau sans salle connue) n'écrase pas l'existant
        if (domicileFiable && existant.domicile !== match.domicile) data.domicile = match.domicile
        // Un résultat ne recule jamais : un score vide côté fédération n'efface
        // ni un score déjà connu ni un match déjà marqué comme joué.
        if (match.termine) {
          if (match.scoreEquipe !== null && match.scoreAdversaire !== null) {
            if (
              existant.scoreEquipe !== match.scoreEquipe ||
              existant.scoreAdversaire !== match.scoreAdversaire ||
              !existant.termine
            ) {
              data.scoreEquipe = match.scoreEquipe
              data.scoreAdversaire = match.scoreAdversaire
              data.termine = true
            }
          } else if (!existant.termine) {
            data.termine = true
          }
        }
        if (existant.logoAdversaire !== match.logoAdversaire && match.logoAdversaire) {
          data.logoAdversaire = match.logoAdversaire
        }
        // Une salle saisie à la main n'est pas écrasée par « À déterminer »
        if (existant.lieu !== match.lieu && match.lieu !== LIEU_INCONNU) data.lieu = match.lieu
        if (competition && existant.competition !== competition) data.competition = competition

        if (Object.keys(data).length > 0) {
          await prisma.match.update({ where: { id: existant.id }, data })
          matchesUpdated++
          console.log(`  ✅ Match mis à jour: ${match.adversaire}`)
        } else {
          matchesSkipped++
        }
      }

      // Matchs en base que la fédération ne liste plus (reportés, doublons d'une
      // ancienne synchronisation). Ils sont signalés, jamais supprimés : des
      // inscriptions de bénévoles peuvent y être rattachées.
      const adversairesConnus = new Set(datees.map((rencontre) => cleEquipe(rencontre.adversaire)))
      for (const existant of existants) {
        if (associes.has(existant.id)) continue
        const date = existant.date.toISOString().slice(0, 10)
        const motif = adversairesConnus.has(cleEquipe(existant.adversaire))
          ? 'date différente'
          : 'adversaire absent du calendrier'
        orphelins.push(`${existant.adversaire} (${date}, ${motif})`)
      }
      if (orphelins.length > 0) {
        console.log(`  ⚠️  ${orphelins.length} match(s) en base absents de FFHandball:`)
        orphelins.forEach((orphelin) => console.log(`       - ${orphelin}`))
      }
    }

    // Classement : remplacé d'un bloc, et seulement s'il a été lu en entier.
    // Un bloc absent ou partiel laisse le classement en base tel quel.
    const classement = calendrier.classement
    if (classement) {
      await prisma.$transaction([
        prisma.classement.deleteMany({ where: { equipeId } }),
        prisma.classement.createMany({
          data: classement.map((ligne) => ({ equipeId, ...ligne })),
        }),
      ])
    } else {
      console.log('  ⚠️  Classement illisible sur FFHandball : classement en base conservé')
    }
    const classementUpdated = classement?.length ?? 0

    const resume = `${matchesCreated} créés, ${matchesUpdated} mis à jour, ${matchesSkipped} inchangés. Classement: ${classementUpdated} équipes`
    await prisma.syncLog.create({
      data: {
        equipeId,
        type: 'matches',
        status: 'success',
        message:
          orphelins.length > 0
            ? `${resume}. ${orphelins.length} match(s) en base absents de FFHandball: ${orphelins.join(' ; ')}`
            : resume,
        matchesCreated,
        matchesUpdated,
        matchesSkipped,
      },
    })

    if (!cache) await enregistrerCacheSalles(cacheSalles)

    return {
      equipeId,
      equipeNom,
      status: 'success',
      message: resume,
      matchesCreated,
      matchesUpdated,
      matchesSkipped,
      classementUpdated,
      orphelins,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    console.error(`  ❌ Erreur pour ${equipeNom}:`, message)

    // Si la base elle-même est en cause, l'équipe suivante doit quand même être traitée
    try {
      await prisma.syncLog.create({
        data: {
          equipeId,
          type: 'matches',
          status: 'error',
          message,
          matchesCreated,
          matchesUpdated,
          matchesSkipped,
        },
      })
      if (!cache) await enregistrerCacheSalles(cacheSalles)
    } catch (erreurJournal) {
      console.error('  ❌ Journal de synchronisation non enregistré:', erreurJournal)
    }

    return {
      equipeId,
      equipeNom,
      status: 'error',
      message,
      matchesCreated,
      matchesUpdated,
      matchesSkipped,
      classementUpdated: 0,
      orphelins: [],
    }
  }
}

/**
 * Synchronise les matchs et classements de toutes les équipes publiées
 * qui ont un lien FFHandball.
 */
export async function syncAllMatches(): Promise<SyncResult[]> {
  const results: SyncResult[] = []

  const equipes = await prisma.equipe.findMany({
    where: { published: true, matches: { not: null } },
    orderBy: { ordre: 'asc' },
    select: { id: true, nom: true, categorie: true, matches: true },
  })

  console.log(`📅 Synchronisation de ${equipes.length} équipes`)
  const cache = await chargerCacheSalles()

  for (const equipe of equipes) {
    if (!equipe.matches?.trim()) continue

    results.push(
      await syncTeamMatches(equipe.id, equipe.nom, equipe.matches, equipe.categorie, cache)
    )
    // Les salles déjà lues sont gardées même si une équipe suivante échoue
    await enregistrerCacheSalles(cache)
    await pause()
  }

  const total = (champ: 'matchesCreated' | 'matchesUpdated' | 'matchesSkipped') =>
    results.reduce((somme, resultat) => somme + resultat[champ], 0)
  const erreurs = results.filter((resultat) => resultat.status === 'error')

  console.log('\n📊 Résultats de la synchronisation:')
  console.log('=====================================')
  console.log(`✅ Matchs créés: ${total('matchesCreated')}`)
  console.log(`🔄 Matchs mis à jour: ${total('matchesUpdated')}`)
  console.log(`⏭️  Matchs inchangés: ${total('matchesSkipped')}`)
  console.log(`❌ Erreurs: ${erreurs.length}`)

  if (erreurs.length > 0) {
    console.log('\nDétail des erreurs:')
    erreurs.forEach((erreur) => console.log(`  - ${erreur.equipeNom}: ${erreur.message}`))
  }

  return results
}
