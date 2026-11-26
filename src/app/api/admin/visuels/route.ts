import { NextRequest, NextResponse } from 'next/server'
import { sessionAdmin } from '@/lib/auth-utils'
import { lireSemaine } from '@/lib/resultats-weekend'
import {
  LONGUEUR_COMPETITION,
  LONGUEUR_INFO,
  LONGUEUR_NOM,
  LONGUEUR_SALLE,
  composerGameDay,
  couleurParDefaut,
  lireCouleur,
  photoGameDayAutorisee,
} from '@/lib/visuels/composition'
import { chargerMatchGameDay, chargerWeekend, idPage, lireGabarit } from '@/lib/visuels/donnees'
import { rendreGameDay, rendreVisuel } from '@/lib/visuels/rendu'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * Visuel PNG 1080 × 1350 du week-end.
 * GET /api/admin/visuels?gabarit=planning|resultat&semaine=AAAA-MM-JJ&page=couverture|domicile-1|exterieur-1
 * GET /api/admin/visuels?gabarit=gameday&match=ID&couleur=bleu|orange|rose&nom=…&salle=…&info=…&photo=URL
 */
export async function GET(request: NextRequest) {
  if (!(await sessionAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const parametres = request.nextUrl.searchParams
  if (parametres.get('gabarit') === 'gameday') return gameDay(parametres)
  const gabarit = lireGabarit(parametres.get('gabarit'))
  if (!gabarit) {
    return NextResponse.json({ error: 'Gabarit inconnu' }, { status: 400 })
  }
  const lundi = lireSemaine(parametres.get('semaine') ?? undefined, new Date())
  const pageDemandee = parametres.get('page') ?? 'couverture'

  try {
    const composition = await chargerWeekend(lundi, gabarit)
    if (pageDemandee === 'couverture') {
      return await rendreVisuel(gabarit, composition.titre, { type: 'couverture' })
    }
    const page = composition.pages.find((p) => idPage(p) === pageDemandee)
    if (!page) {
      return NextResponse.json({ error: 'Page vide ou inconnue' }, { status: 404 })
    }
    return await rendreVisuel(gabarit, composition.titre, { type: 'liste', page })
  } catch (erreur) {
    console.error('Visuel non généré', erreur instanceof Error ? erreur.message : 'erreur inconnue')
    return NextResponse.json({ error: 'Visuel non généré' }, { status: 500 })
  }
}

async function gameDay(parametres: URLSearchParams) {
  const id = Number(parametres.get('match'))
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Match invalide' }, { status: 400 })
  }
  // Textes libres bornés : ils ne servent qu'à l'affichage
  const nom = (parametres.get('nom') ?? '').slice(0, LONGUEUR_NOM)
  const competition = (parametres.get('competition') ?? '').slice(0, LONGUEUR_COMPETITION)
  const salle = (parametres.get('salle') ?? '').slice(0, LONGUEUR_SALLE)
  const info = parametres.has('info') ? (parametres.get('info') ?? '').slice(0, LONGUEUR_INFO) : undefined
  // Photo déposée pour l'affiche : seulement le dossier gameday/ du magasin Blob du site
  const photoDeposee = parametres.get('photo') || null
  if (photoDeposee && (photoDeposee.length > 500 || !photoGameDayAutorisee(photoDeposee, process.env.BLOB_READ_WRITE_TOKEN))) {
    return NextResponse.json({ error: 'Photo refusée' }, { status: 400 })
  }
  try {
    const match = await chargerMatchGameDay(id)
    if (!match) {
      return NextResponse.json({ error: 'Match introuvable' }, { status: 404 })
    }
    const affiche = composerGameDay(match, { nomAdversaire: nom, competition, salle, info })
    const couleur = lireCouleur(parametres.get('couleur'), couleurParDefaut(match))
    return await rendreGameDay(affiche, couleur, photoDeposee ?? match.equipe.banniere ?? match.equipe.photo)
  } catch (erreur) {
    console.error('Game Day non généré', erreur instanceof Error ? erreur.message : 'erreur inconnue')
    return NextResponse.json({ error: 'Visuel non généré' }, { status: 500 })
  }
}
