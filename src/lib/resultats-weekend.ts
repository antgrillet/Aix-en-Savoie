/**
 * Calculs purs pour la page admin « Résultats du week-end » :
 * bornes de semaine à l'heure de Paris, regroupement des plateaux,
 * issue d'un match et libellé de la salle.
 */

const FUSEAU_CLUB = 'Europe/Paris'

const formatJour = new Intl.DateTimeFormat('en-CA', {
  timeZone: FUSEAU_CLUB,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const formatHorloge = new Intl.DateTimeFormat('en-US', {
  timeZone: FUSEAU_CLUB,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

/** Jour calendaire à Paris, au format AAAA-MM-JJ. */
export function jourParis(date: Date): string {
  return formatJour.format(date)
}

function decomposer(jour: string): [number, number, number] {
  const [annee, mois, numero] = jour.split('-').map(Number)
  return [annee, mois, numero]
}

export function ajouterJours(jour: string, nombre: number): string {
  const [annee, mois, numero] = decomposer(jour)
  return new Date(Date.UTC(annee, mois - 1, numero + nombre)).toISOString().slice(0, 10)
}

/** Nombre de jours écoulés depuis le lundi (0 = lundi, 6 = dimanche). */
function rangDansLaSemaine(jour: string): number {
  const [annee, mois, numero] = decomposer(jour)
  return (new Date(Date.UTC(annee, mois - 1, numero)).getUTCDay() + 6) % 7
}

export function lundiDe(jour: string): string {
  return ajouterJours(jour, -rangDansLaSemaine(jour))
}

function decalageParisMinutes(instant: Date): number {
  const valeurs = Object.fromEntries(
    formatHorloge
      .formatToParts(instant)
      .filter((partie) => partie.type !== 'literal')
      .map((partie) => [partie.type, Number(partie.value)])
  )
  const commeUtc = Date.UTC(
    valeurs.year,
    valeurs.month - 1,
    valeurs.day,
    valeurs.hour,
    valeurs.minute,
    valeurs.second
  )
  return (commeUtc - instant.getTime()) / 60000
}

/** Instant UTC correspondant à minuit, heure de Paris, pour un jour donné. */
function minuitParis(jour: string): Date {
  const [annee, mois, numero] = decomposer(jour)
  const minuitUtc = Date.UTC(annee, mois - 1, numero)
  return new Date(minuitUtc - decalageParisMinutes(new Date(minuitUtc)) * 60000)
}

/**
 * Semaine affichée par défaut : du lundi au mercredi on regarde encore
 * le week-end qui vient de se jouer, à partir du jeudi celui qui arrive.
 */
export function semaineParDefaut(maintenant: Date): string {
  const aujourdhui = jourParis(maintenant)
  const lundi = lundiDe(aujourdhui)
  return rangDansLaSemaine(aujourdhui) <= 2 ? ajouterJours(lundi, -7) : lundi
}

/** Lit le paramètre `semaine` de l'URL ; toute valeur invalide retombe sur le défaut. */
export function lireSemaine(parametre: string | undefined, maintenant: Date): string {
  if (parametre && /^\d{4}-\d{2}-\d{2}$/.test(parametre)) {
    const date = new Date(`${parametre}T00:00:00Z`)
    if (!Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === parametre) {
      return lundiDe(parametre)
    }
  }
  return semaineParDefaut(maintenant)
}

export function bornesSemaine(lundi: string) {
  return {
    debut: minuitParis(lundi),
    fin: minuitParis(ajouterJours(lundi, 7)),
    samedi: ajouterJours(lundi, 5),
    dimanche: ajouterJours(lundi, 6),
  }
}

/** Catégories jouées en plateau : plusieurs matchs au même endroit le même jour. */
const CATEGORIES_PLATEAU = ['-11', '-9']

export function estCategoriePlateau(categorie: string): boolean {
  return CATEGORIES_PLATEAU.some((prefixe) => categorie.trim().startsWith(prefixe))
}

export interface MatchResultat {
  id: number
  adversaire: string
  date: Date
  lieu: string
  domicile: boolean
  scoreEquipe: number | null
  scoreAdversaire: number | null
  termine: boolean
}

/** Un déplacement ou une réception : un match, ou plusieurs pour un plateau. */
export interface Rencontre<T extends MatchResultat> {
  cle: string
  date: Date
  lieu: string
  domicile: boolean
  matchs: T[]
}

/**
 * Regroupe les matchs d'une équipe. En plateau, les matchs du même jour
 * forment une seule rencontre (une équipe ne joue qu'un plateau par jour) ;
 * sinon chaque match reste seul.
 */
export function regrouperRencontres<T extends MatchResultat>(
  matchs: T[],
  plateau: boolean
): Rencontre<T>[] {
  const tries = [...matchs].sort((a, b) => a.date.getTime() - b.date.getTime())
  const rencontres = new Map<string, Rencontre<T>>()

  for (const match of tries) {
    const cle = plateau ? `plateau-${jourParis(match.date)}` : `match-${match.id}`
    const existante = rencontres.get(cle)
    if (existante) {
      existante.matchs.push(match)
      // Un match dont la salle manque ne doit pas masquer celle du plateau
      if (lieuInconnu(existante.lieu) && !lieuInconnu(match.lieu)) {
        existante.lieu = match.lieu
        existante.domicile = match.domicile
      }
    } else {
      rencontres.set(cle, {
        cle,
        date: match.date,
        lieu: match.lieu,
        domicile: match.domicile,
        matchs: [match],
      })
    }
  }

  return [...rencontres.values()]
}

export type Issue = 'victoire' | 'nul' | 'defaite'

/** Issue vue du club, ou `null` tant que le score n'est pas connu. */
export function issueMatch(
  match: Pick<MatchResultat, 'scoreEquipe' | 'scoreAdversaire' | 'termine'>
): Issue | null {
  if (!match.termine || match.scoreEquipe === null || match.scoreAdversaire === null) {
    return null
  }
  if (match.scoreEquipe > match.scoreAdversaire) return 'victoire'
  if (match.scoreEquipe < match.scoreAdversaire) return 'defaite'
  return 'nul'
}

function lieuInconnu(lieu: string): boolean {
  const brut = lieu.trim()
  return !brut || /^[àa] d[ée]terminer$/i.test(brut) || /^plateau$/i.test(brut)
}

const SALLES_DOMICILE: { motif: RegExp; libelle: string }[] = [
  { motif: /marlioz/i, libelle: 'Gymnase de Marlioz' },
  { motif: /pr[eé]s?[\s-]*riants?/i, libelle: 'Gymnase des Prés Riants' },
]

/** Libellé de la salle ; les deux gymnases du club sont reconnus et normalisés. */
export function libelleLieu(lieu: string, domicile: boolean): string {
  const brut = lieu.trim()
  if (lieuInconnu(brut)) {
    return domicile ? 'Salle à confirmer' : 'Lieu à confirmer'
  }
  const salle = SALLES_DOMICILE.find(({ motif }) => motif.test(brut))
  return salle ? salle.libelle : brut
}
