/**
 * Appels au site FFHandball. Un simple fetch suffit : les données sont dans le
 * HTML servi (voir `donnees.ts`), aucun navigateur n'est nécessaire.
 */

import {
  ORIGINE_FFHB,
  analyserUrl,
  clubEngage,
  competitionsDeLaPage,
  equipesDuClub,
  extraireComposants,
  lireCalendrierEquipe,
  lireSalle,
  poulesDeLaPage,
  slugFfhb,
  urlEquipe,
  type CalendrierEquipe,
  type Composants,
  type SalleFfhb,
} from './donnees'

const DELAI_MAX_MS = 30_000
const PAUSE_ENTRE_APPELS_MS = 300

export function pause(duree = PAUSE_ENTRE_APPELS_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duree))
}

async function chargerPage(url: string): Promise<Composants> {
  const reponse = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; sync-matchs)', Accept: 'text/html' },
    signal: AbortSignal.timeout(DELAI_MAX_MS),
    cache: 'no-store',
  })
  if (!reponse.ok) {
    throw new Error(`FFHandball a répondu ${reponse.status} pour ${url}`)
  }
  return extraireComposants(await reponse.text())
}

export interface CalendrierCharge extends CalendrierEquipe {
  /** Adresse de la compétition, pour retrouver ensuite les salles. */
  racine: string
}

/**
 * Charge le calendrier complet d'une équipe à partir du lien saisi dans l'admin.
 * Un lien d'équipe est lu directement ; un lien de poule ou de compétition est
 * accepté tant qu'une seule équipe du club y figure.
 */
export async function chargerCalendrierEquipe(lien: string): Promise<CalendrierCharge> {
  const adresse = analyserUrl(lien)
  if (!adresse) {
    throw new Error('Lien FFHandball non reconnu : il doit pointer vers une compétition de www.ffhandball.fr')
  }

  let extEquipeId = adresse.extEquipeId
  if (!extEquipeId) {
    const page = await chargerPage(
      adresse.extPouleId ? `${adresse.racine}/poule-${adresse.extPouleId}/` : `${adresse.racine}/`
    )
    const equipes = equipesDuClub(page)
    if (equipes.length === 0) {
      throw new Error("Aucune équipe du club dans cette poule : le lien date peut-être d'une autre saison ou d'une autre phase")
    }
    if (equipes.length > 1) {
      throw new Error(
        `Plusieurs équipes du club dans cette poule (${equipes.map((e) => e.libelle).join(', ')}) : utiliser le lien de l'équipe`
      )
    }
    extEquipeId = equipes[0].extEquipeId
    await pause()
  }
  if (!/^\d+$/.test(extEquipeId)) {
    throw new Error("Identifiant d'équipe FFHandball inattendu")
  }

  const calendrier = lireCalendrierEquipe(
    await chargerPage(urlEquipe(adresse.racine, extEquipeId)),
    extEquipeId
  )
  return { ...calendrier, racine: adresse.racine }
}

/** Charge la salle d'une rencontre depuis sa page détail. */
export async function chargerSalle(
  racine: string,
  extPouleId: string,
  extRencontreId: string
): Promise<SalleFfhb | null> {
  if (!/^\d+$/.test(extPouleId) || !/^\d+$/.test(extRencontreId)) return null
  return lireSalle(await chargerPage(`${racine}/poule-${extPouleId}/rencontre-${extRencontreId}/`))
}

export interface EngagementClub {
  competition: string
  poule: string
  equipe: string
  url: string
}

/**
 * Liste les équipes du club engagées dans les compétitions d'une instance
 * (comité ou ligue) pour une saison. Sert à retrouver les liens à saisir dans
 * l'admin en début de saison ou de phase.
 *
 * @param saison  segment d'URL, par exemple `saison-2026-2027-22`
 * @param type    `departemental` ou `regional`
 * @param instance segment d'URL de l'instance, par exemple `comite-de-savoie-103`
 */
export async function listerEngagementsClub(
  saison: string,
  type: string,
  instance: string
): Promise<EngagementClub[]> {
  if (![saison, type, instance].every((segment) => /^[a-z0-9-]+$/.test(segment))) {
    throw new Error('Saison, type ou instance invalide')
  }

  const base = `${ORIGINE_FFHB}/competitions/${saison}/${type}`
  const competitions = competitionsDeLaPage(await chargerPage(`${base}/o-${instance}/`))
  const engagements: EngagementClub[] = []

  for (const competition of competitions) {
    await pause()
    const racine = `${base}/${slugFfhb(competition.libelle)}-${competition.extCompetitionId}`
    const accueil = await chargerPage(`${racine}/`)
    if (!clubEngage(accueil)) continue

    for (const poule of poulesDeLaPage(accueil)) {
      await pause()
      const page = await chargerPage(`${racine}/poule-${poule.extPouleId}/`)
      for (const equipe of equipesDuClub(page)) {
        engagements.push({
          competition: competition.libelle,
          poule: poule.libelle,
          equipe: equipe.libelle,
          url: urlEquipe(racine, equipe.extEquipeId),
        })
      }
    }
  }

  return engagements
}
