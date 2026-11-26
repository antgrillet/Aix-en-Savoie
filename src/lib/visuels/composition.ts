/**
 * Données des visuels du week-end (Planning et Résultat), sans rendu.
 * Reprend la disposition des modèles Canva du club : une page Domicile,
 * une page Extérieur, deux colonnes de cinq lignes au plus.
 */
import { ajouterJours, estCategoriePlateau, issueMatch, jourParis, libelleLieu, regrouperRencontres, type MatchResultat } from '@/lib/resultats-weekend'

export type Gabarit = 'planning' | 'resultat'
export type Cote = 'domicile' | 'exterieur'

export interface MatchVisuel extends MatchResultat {
  logoAdversaire: string | null
  equipe: { id: number; nom: string; categorie: string; ordre: number }
}

export interface ResultatLigne {
  /** Victoire, défaite ou nul ; pour un plateau, d'après le bilan */
  signe: 'victoire' | 'defaite' | 'nul'
  /** Scores dans l'ordre du match (recevant d'abord), ou bilan V - D d'un plateau (vide si inconnu) */
  gauche: string
  droite: string
  /** Côté du score du club, écrit en gras ; `null` pour un plateau */
  gras: 'gauche' | 'droite' | null
  plateau: boolean
}

export interface LigneVisuel {
  cle: string
  code: string
  /** Logos adverses (plusieurs pour un plateau), au plus deux affichés */
  logos: string[]
  /** « SAMEDI 20H00 » */
  horaire: string
  resultat: ResultatLigne | null
}

export interface PageVisuel {
  cote: Cote
  /** 1, 2… quand une page déborde de dix lignes */
  numero: number
  colonnes: [LigneVisuel[], LigneVisuel[]]
}

/** Longueurs maximales des textes libres d'une affiche Game Day (page d'admin et API) */
export const LONGUEUR_NOM = 24
export const LONGUEUR_COMPETITION = 60
export const LONGUEUR_SALLE = 50
export const LONGUEUR_INFO = 40

export const LIGNES_PAR_COLONNE = 5
const LIGNES_PAR_PAGE = LIGNES_PAR_COLONNE * 2

/** « U11 », « −11 » (signe moins) ou « –11 » (tiret) s'écrivent « -11 », comme dans la base */
function normaliserCategorie(texte: string): string {
  return texte.trim().toUpperCase().replace(/^[U−–]\s*(?=\d)/, '-')
}

/** Équipe jouée en plateau (-11, -9), d'après sa catégorie ou son nom, quelle que soit l'écriture du moins */
export function estEquipePlateau(equipe: { nom: string; categorie: string }): boolean {
  return estCategoriePlateau(normaliserCategorie(equipe.categorie)) || estCategoriePlateau(normaliserCategorie(equipe.nom))
}

/**
 * Code court d'une équipe, comme sur les visuels du club :
 * « SENIORS MASCULINS 1 » → SM1, « -18.1M » → U18.1M, « -15F » → U15F.
 * En plateau (-11, -9), le M disparaît : « -11.2M » → U11.2.
 */
export function codeEquipe(nom: string): string {
  const brut = nom.trim().toUpperCase()
  const senior = brut.match(/^SENIORS?\s+(MASCULIN|FEMININ|FÉMININ)\w*\s*(\d+)?$/)
  if (senior) return `S${senior[1].startsWith('M') ? 'M' : 'F'}${senior[2] ?? ''}`
  const jeune = brut.match(/^[-U−–]\s*(\d+)\s*(?:\.\s*(\d+))?\s*([MF])?$/)
  if (jeune) {
    const [, age, numero, genre] = jeune
    const plateau = estEquipePlateau({ nom: brut, categorie: '' })
    const lettre = genre === 'F' || (genre === 'M' && !plateau) ? genre : ''
    return `U${age}${numero ? `.${numero}` : ''}${lettre}`
  }
  return brut
}

const formatJour = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long' })
const formatHeure = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** « SAMEDI 20H00 » à l'heure de Paris */
export function libelleHoraire(date: Date): string {
  return `${formatJour.format(date)} ${formatHeure.format(date).replace(':', 'H')}`.toUpperCase()
}

const MOIS = ['JANVIER', 'FÉVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOÛT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DÉCEMBRE']

/** « WEEKEND DU 21-22 NOVEMBRE », ou « WEEKEND DU 31 OCTOBRE-1 NOVEMBRE » */
export function titreWeekend(lundi: string): string {
  const [, ms, js] = ajouterJours(lundi, 5).split('-').map(Number)
  const [, md, jd] = ajouterJours(lundi, 6).split('-').map(Number)
  const debut = ms === md ? `${js}` : `${js} ${MOIS[ms - 1]}`
  return `WEEKEND DU ${debut}-${jd} ${MOIS[md - 1]}`
}

/** Logo FFHB en 512 px (la base garde l'adresse en 64 px) ; le rendu revient à l'adresse d'origine si besoin */
export function logoGrand(url: string | null): string | null {
  if (!url) return null
  return url.replace('/64/', '/512/')
}

function resultatRencontre(matchs: MatchVisuel[], plateau: boolean): ResultatLigne | null {
  if (!plateau) {
    const match = matchs[0]
    const issue = issueMatch(match)
    if (!issue || match.scoreEquipe === null || match.scoreAdversaire === null) return null
    const club = String(match.scoreEquipe)
    const adverse = String(match.scoreAdversaire)
    return match.domicile
      ? { signe: issue, gauche: club, droite: adverse, gras: 'gauche', plateau: false }
      : { signe: issue, gauche: adverse, droite: club, gras: 'droite', plateau: false }
  }
  const issues = matchs.map(issueMatch).filter((issue) => issue !== null)
  if (issues.length === 0) return null
  const victoires = issues.filter((issue) => issue === 'victoire').length
  const defaites = issues.filter((issue) => issue === 'defaite').length
  return {
    signe: victoires > defaites ? 'victoire' : victoires < defaites ? 'defaite' : 'nul',
    gauche: String(victoires),
    droite: String(defaites),
    gras: null,
    plateau: true,
  }
}

/** Gauche d'abord : 6 lignes → 4 + 2, 8 → 5 + 3, comme sur les visuels publiés */
export function repartirColonnes<T>(lignes: T[]): [T[], T[]] {
  const gauche = Math.min(LIGNES_PAR_COLONNE, Math.ceil(lignes.length / 2) + 1, lignes.length)
  return [lignes.slice(0, gauche), lignes.slice(gauche)]
}

export interface CompositionWeekend {
  titre: string
  pages: PageVisuel[]
  /** Résultat : rencontres jouées dont le score manque (à saisir avant de publier) */
  sansScore: { code: string; adversaire: string; date: Date }[]
  /** Rencontres de la semaine jouées hors samedi-dimanche : elles ne sont pas sur les visuels */
  horsWeekend: { cle: string; equipe: string; date: Date }[]
}

/** Samedi ou dimanche du week-end de la semaine `lundi`, à l'heure de Paris */
export function estDuWeekend(date: Date, lundi: string): boolean {
  const jour = jourParis(date)
  return jour === ajouterJours(lundi, 5) || jour === ajouterJours(lundi, 6)
}

export function composerWeekend(matchs: MatchVisuel[], lundi: string, gabarit: Gabarit, maintenant = new Date()): CompositionWeekend {
  const parEquipe = new Map<number, MatchVisuel[]>()
  for (const match of matchs) {
    parEquipe.set(match.equipe.id, [...(parEquipe.get(match.equipe.id) ?? []), match])
  }

  const lignes: (LigneVisuel & { cote: Cote; ordre: number; date: number })[] = []
  const sansScore: CompositionWeekend['sansScore'] = []
  const horsWeekend: CompositionWeekend['horsWeekend'] = []

  for (const matchsEquipe of parEquipe.values()) {
    const equipe = matchsEquipe[0].equipe
    const plateau = estEquipePlateau(equipe)
    const code = codeEquipe(equipe.nom)
    for (const rencontre of regrouperRencontres(matchsEquipe, plateau)) {
      // Les visuels ne couvrent que le samedi et le dimanche : les autres jours sont signalés à part
      if (!estDuWeekend(rencontre.date, lundi)) {
        horsWeekend.push({ cle: `${equipe.id}-${rencontre.cle}`, equipe: equipe.nom, date: rencontre.date })
        continue
      }
      const joue = rencontre.date.getTime() < maintenant.getTime()
      // La fédération publie rarement les scores des plateaux : la ligne reste, sans bilan
      const resultat =
        resultatRencontre(rencontre.matchs, plateau) ??
        (plateau && joue ? { signe: 'nul' as const, gauche: '', droite: '', gras: null, plateau: true } : null)
      if (gabarit === 'resultat' && !resultat) {
        if (joue) {
          sansScore.push({ code, adversaire: rencontre.matchs.map((m) => m.adversaire).join(', '), date: rencontre.date })
        }
        continue
      }
      const logos = [...new Set(rencontre.matchs.map((m) => logoGrand(m.logoAdversaire)).filter((l) => l !== null))]
      lignes.push({
        cle: rencontre.cle,
        code,
        logos,
        horaire: libelleHoraire(rencontre.date),
        resultat,
        cote: rencontre.domicile ? 'domicile' : 'exterieur',
        ordre: equipe.ordre,
        date: rencontre.date.getTime(),
      })
    }
  }

  lignes.sort((a, b) => a.ordre - b.ordre || a.date - b.date)

  const pages: PageVisuel[] = []
  for (const cote of ['domicile', 'exterieur'] as const) {
    const duCote = lignes.filter((ligne) => ligne.cote === cote).map(({ cote: _c, ordre: _o, date: _d, ...ligne }) => ligne)
    for (let debut = 0, numero = 1; debut < duCote.length; debut += LIGNES_PAR_PAGE, numero++) {
      pages.push({ cote, numero, colonnes: repartirColonnes(duCote.slice(debut, debut + LIGNES_PAR_PAGE)) })
    }
  }

  horsWeekend.sort((a, b) => a.date.getTime() - b.date.getTime())
  return { titre: titreWeekend(lundi), pages, sansScore, horsWeekend }
}

/** Texte prêt à coller sous la publication */
export function legende(composition: CompositionWeekend, gabarit: Gabarit): string {
  const titre = composition.titre.toLowerCase().replace('weekend', 'week-end')
  const lignes = composition.pages.flatMap((page) =>
    page.colonnes.flat().map((ligne) => {
      const lieu = page.cote === 'domicile' ? '🏠' : '🚌'
      if (gabarit === 'planning') return `${lieu} ${ligne.code} · ${ligne.horaire.toLowerCase()}`
      const r = ligne.resultat
      if (!r) return `${lieu} ${ligne.code}`
      const signe = r.signe === 'victoire' ? '✅' : r.signe === 'defaite' ? '❌' : '🟰'
      if (r.plateau) return r.gauche ? `${lieu} ${ligne.code} ${signe} plateau ${r.gauche}V ${r.droite}D` : `${lieu} ${ligne.code} plateau`
      return `${lieu} ${ligne.code} ${signe} ${r.gauche}-${r.droite}`
    })
  )
  const entete = gabarit === 'planning' ? `🐯 Planning du ${titre}` : `🐯 Résultats du ${titre}`
  return [entete, '', ...lignes, '', '🧡🖤 Orange et noir, pour la victoire !', '#HBCA #handball #AixLesBains'].join('\n')
}

/* --------------------------------------------------------------------------
 * Game Day : l'affiche d'un match
 * ------------------------------------------------------------------------ */

export const COULEURS_GAME_DAY = {
  bleu: '#5d85fe',
  orange: '#ff741f',
  rose: '#ff64ab',
} as const
export type CouleurGameDay = keyof typeof COULEURS_GAME_DAY

export function lireCouleur(valeur: string | null | undefined, defaut: CouleurGameDay = 'bleu'): CouleurGameDay {
  return valeur && valeur in COULEURS_GAME_DAY ? (valeur as CouleurGameDay) : defaut
}

const MOTS_VIDES = new Set([
  'HANDBALL', 'HAND', 'BALL', 'CLUB', 'HBC', 'HB', 'HC', 'HBCA', 'ASSOCIATION', 'SPORTIVE', 'SPORTIF', 'SPORTS', 'SPORT',
  'US', 'AS', 'ES', 'SC', 'CS', 'AL', 'TEAM', 'ENTENTE', 'SENIORS', 'SENIOR', 'SÉNIORS', 'SÉNIOR', 'MASCULINS', 'MASCULIN',
  'FEMININES', 'FÉMININES', 'FEMININ', 'FÉMININ', 'P16F', 'P16M', 'PNF', 'PNM', 'N3M', 'N3F', 'DIV', '-',
])
/** Noms tels que le club les écrit sur ses affiches */
const SURNOMS: Record<string, string> = {
  ARLESIEN: 'ARLES',
  'MENDE GEVAUDAN': 'MENDE',
  ROCHETTOIS: 'LA ROCHETTE',
  'ROCHETTOIS FILLES': 'LA ROCHETTE',
  BOURGETAIN: 'LE BOURGET',
}
const ARTICLES = new Set(['DE', 'DU', 'DES', 'LA', 'LE', 'LES', "D'", "L'"])
/** Mots qui ne terminent pas un nom : « ST JULIEN EN » n'est pas un nom de club */
const LIAISONS = new Set([...ARTICLES, 'EN', 'SUR', 'SOUS', 'AU', 'AUX', 'ET'])

/** Trois mots, plus ceux qui suivent une liaison (« ST JULIEN EN GENEVOIS »), sans dépasser `LONGUEUR_NOM` */
function abreger(mots: string[]): string {
  const retenus: string[] = []
  for (const mot of mots) {
    const derniere = retenus[retenus.length - 1]
    if (retenus.length >= 3 && !(derniere && LIAISONS.has(derniere))) break
    if ([...retenus, mot].join(' ').length > LONGUEUR_NOM) break
    retenus.push(mot)
  }
  while (retenus.length > 1 && LIAISONS.has(retenus[retenus.length - 1])) retenus.pop()
  if (retenus.length) return retenus.join(' ')
  // Un seul mot trop long : coupé au dernier trait d'union qui tient (« SAINT-MARTIN-D-HERES »)
  const coupe = (mots[0] ?? '').slice(0, LONGUEUR_NOM + 1)
  return coupe.length > LONGUEUR_NOM && coupe.lastIndexOf('-') > 0 ? coupe.slice(0, coupe.lastIndexOf('-')) : coupe.slice(0, LONGUEUR_NOM)
}

/** « ASSOCIATION SPORTIVE HANDBALL CLUB DE CHALON » → « CHALON », « ANNECY HANDBALL » → « ANNECY » */
export function nomCourt(adversaire: string): string {
  const mots: string[] = []
  // L'article de tête ne tombe que s'il suivait un mot retiré : « CLUB DE LA FILLIERE » → FILLIERE,
  // mais « LA MOTTE SERVOLEX » garde son article
  let apresMotRetire = false
  for (const mot of adversaire.toUpperCase().replace(/[(),.]/g, ' ').split(/\s+/)) {
    if (!mot) continue
    // « U18 », « M13M », « 11 » : catégorie, pas nom de club
    if (MOTS_VIDES.has(mot) || /^\d+$/.test(mot) || /^[UM]\d{1,2}[MFX]?$/.test(mot)) {
      apresMotRetire = true
      continue
    }
    if (mots.length === 0 && apresMotRetire && ARTICLES.has(mot)) continue
    mots.push(mot)
  }
  while (mots.length && ARTICLES.has(mots[mots.length - 1])) mots.pop()
  const nom = abreger(mots.length ? mots : adversaire.toUpperCase().split(/\s+/).filter(Boolean))
  return SURNOMS[nom] ?? nom
}

const ACCENTS: [RegExp, string][] = [
  [/\bprenationale\b/gi, 'Prénationale'],
  [/\bfeminines?\b/gi, 'Féminine'],
  [/\bregionale\b/gi, 'Régionale'],
  [/\b1ere\b/gi, '1ère'],
  [/\b2eme\b/gi, '2ème'],
  [/\belite\b/gi, 'Élite'],
]

/** « Prenationale Feminine Aura » → « PRÉNATIONALE FÉMININE » ; saison et ligue retirées */
export function libelleCompetition(competition: string | null): string {
  if (!competition) return ''
  let texte = competition
    .replace(/\b(19|20)\d{2}\s*[-/]\s*(19|20)\d{2}\b/g, '')
    .replace(/\b(Aura|AURA|P16|P73|P74)\b/g, '')
  for (const [motif, remplacement] of ACCENTS) texte = texte.replace(motif, remplacement)
  return texte.replace(/\s+/g, ' ').trim().toUpperCase()
}

const formatJourNumero = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric' })
const formatMois = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', month: 'long' })

export interface GameDay {
  competition: string
  /** « SAMEDI 28 » et « NOVEMBRE » */
  jour: [string, string]
  heure: string
  salle: string
  /** Ligne sous la salle, par exemple « ENTRÉE PAYANTE : 3€ » ; vide sinon */
  info: string
  /** Équipe qui reçoit à gauche, comme sur les affiches du club */
  gauche: { nom: string; logo: string | null; club: boolean }
  droite: { nom: string; logo: string | null; club: boolean }
}

type MatchGameDay = Pick<MatchVisuel, 'adversaire' | 'date' | 'lieu' | 'domicile' | 'logoAdversaire'> & { competition: string | null }

/** Comme sur les affiches publiées : rose pour la Coupe, bleu à domicile, orange à l'extérieur */
export function couleurParDefaut(match: Pick<MatchGameDay, 'domicile' | 'competition'>): CouleurGameDay {
  if (/coupe/i.test(match.competition ?? '')) return 'rose'
  return match.domicile ? 'bleu' : 'orange'
}

/** Seule la Nationale 3 à domicile affiche l'entrée payante sur les affiches du club */
export function infoParDefaut(match: Pick<MatchGameDay, 'domicile' | 'competition'>): string {
  return match.domicile && /^nationale/i.test(libelleCompetition(match.competition)) ? 'ENTRÉE PAYANTE : 3€' : ''
}

// `\b` ne voit pas la fin de « CITÉ » (É n'est pas un caractère de mot en JavaScript) : on attend un espace ou la fin
const DEBUTS_DE_SALLE =
  /^(GYMNASE|SALLE|COMPLEXE|CENTRE|ESPACE|HALLE|HALL|PALAIS|MAISON|ARENA|STADE|DOJO|PALESTRE|CITÉ|CITE|COSEC|COLLÈGE|COLLEGE|LYCÉE|LYCEE|PARC|LIEU)(?=\s|$)/

/** « La Verrerie, Chalon sur Saone » → « SALLE LA VERRERIE », « Gymnase des Prés Riants » inchangé */
export function libelleSalle(lieu: string, domicile: boolean): string {
  const salle = libelleLieu(lieu, domicile).split(',')[0].trim().toUpperCase()
  return DEBUTS_DE_SALLE.test(salle) ? salle : `SALLE ${salle}`
}

export function composerGameDay(
  match: MatchGameDay,
  options: { nomAdversaire?: string; competition?: string; info?: string; salle?: string } = {}
): GameDay {
  const club = { nom: 'HBCA', logo: null, club: true }
  const adverse = {
    nom: (options.nomAdversaire?.trim() || nomCourt(match.adversaire)).slice(0, LONGUEUR_NOM).toUpperCase(),
    logo: logoGrand(match.logoAdversaire),
    club: false,
  }
  return {
    competition: (options.competition?.trim() || libelleCompetition(match.competition)).slice(0, LONGUEUR_COMPETITION).toUpperCase(),
    jour: [formatJourNumero.format(match.date).toUpperCase(), formatMois.format(match.date).toUpperCase()],
    heure: formatHeure.format(match.date).replace(':', 'H'),
    salle: (options.salle?.trim() || libelleSalle(match.lieu, match.domicile)).slice(0, LONGUEUR_SALLE).toUpperCase(),
    info: (options.info ?? infoParDefaut(match)).trim().slice(0, LONGUEUR_INFO).toUpperCase(),
    gauche: match.domicile ? club : adverse,
    droite: match.domicile ? adverse : club,
  }
}

/**
 * Photo déposée par l'admin pour une affiche : seulement une adresse https du magasin Vercel Blob
 * du site, dans le dossier gameday/. L'hôte se déduit du jeton `vercel_blob_rw_<storeId>_<secret>`
 * (comme dans @vercel/blob) ; le jeton lui-même n'est jamais renvoyé ni journalisé.
 */
export function photoGameDayAutorisee(url: string, jeton: string | undefined): boolean {
  const magasin = jeton?.split('_')[3]
  if (!jeton?.startsWith('vercel_blob_rw_') || !magasin || !/^[A-Za-z0-9]+$/.test(magasin)) return false
  try {
    const adresse = new URL(url)
    return (
      adresse.protocol === 'https:' &&
      adresse.hostname === `${magasin.toLowerCase()}.public.blob.vercel-storage.com` &&
      adresse.port === '' &&
      !adresse.username &&
      !adresse.password &&
      // L'URL est déjà normalisée : « /gameday/../x » est devenu « /x »
      adresse.pathname.startsWith('/gameday/')
    )
  } catch {
    return false
  }
}
