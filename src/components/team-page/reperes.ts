/**
 * Calculs des « repères » de la page d'une équipe : prochain match, dernier
 * résultat, forme et rang. Fonctions pures, sans accès à la base.
 */

export interface MatchRepere {
  id: number
  date: Date
  adversaire: string
  domicile: boolean
  termine: boolean
  scoreEquipe: number | null
  scoreAdversaire: number | null
  logoAdversaire: string | null
}

export interface LigneClassement {
  id: number
  position: number
  club: string
  points: number
}

export type Issue = 'victoire' | 'defaite' | 'nul'

export type MatchJoue = MatchRepere & { scoreEquipe: number; scoreAdversaire: number }

/** Un match terminé dont les deux scores sont connus. */
export function estJoue(match: MatchRepere): match is MatchJoue {
  return match.termine && match.scoreEquipe !== null && match.scoreAdversaire !== null
}

export function issueDe(match: MatchJoue): Issue {
  if (match.scoreEquipe > match.scoreAdversaire) return 'victoire'
  if (match.scoreEquipe < match.scoreAdversaire) return 'defaite'
  return 'nul'
}

/** Ligne du classement qui correspond au club (même règle que l'ancienne page). */
export function estNotreClub(club: string): boolean {
  const nom = club.toUpperCase()
  return nom.includes('HBC AIX') || nom.includes('AIX EN SAVOIE')
}

/** « 1er », « 4e ». */
export function rangOrdinal(position: number): string {
  return position === 1 ? '1er' : `${position}e`
}

/** Deux initiales pour un écusson sans logo : « VAL DE LEYSSE » → « VD ». */
export function initialesClub(nom: string): string {
  const mots = nom
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return mots
    .slice(0, 2)
    .map((mot) => mot[0])
    .join('')
    .toUpperCase()
}

export interface Reperes {
  prochain: MatchRepere | null
  dernier: MatchJoue | null
  forme: MatchJoue[]
  rang: { ligne: LigneClassement; total: number } | null
}

/**
 * Les matchs sont attendus triés par date croissante (ordre de la requête).
 * La forme garde l'ordre chronologique : le plus récent à droite.
 */
export function calculerReperes(
  matchs: MatchRepere[],
  classement: LigneClassement[],
  maintenant: Date,
  tailleForme = 5
): Reperes {
  const prochain = matchs.find((match) => match.date >= maintenant && !match.termine) ?? null
  const joues = matchs.filter(estJoue)
  const dernier = joues.at(-1) ?? null
  const forme = joues.slice(-tailleForme)
  const notreLigne = classement.find((ligne) => estNotreClub(ligne.club))
  const rang = notreLigne ? { ligne: notreLigne, total: classement.length } : null
  return { prochain, dernier, forme, rang }
}

/**
 * Logos connus par nom d'adversaire (le classement n'a pas de logo : on
 * reprend ceux des matchs de l'équipe).
 */
export function logosParClub(matchs: MatchRepere[]): Map<string, string> {
  const logos = new Map<string, string>()
  for (const match of matchs) {
    if (match.logoAdversaire) logos.set(match.adversaire.trim().toUpperCase(), match.logoAdversaire)
  }
  return logos
}
