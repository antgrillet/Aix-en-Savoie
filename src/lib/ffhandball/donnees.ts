/**
 * Lecture des données du site FFHandball, sans réseau ni navigateur.
 *
 * Chaque bloc d'une page fédérale embarque ses données en JSON dans l'attribut
 * `attributes` d'une balise <smartfire-component>. Ce module extrait ces blocs,
 * les valide et les convertit vers le modèle de l'application.
 */

import { z } from 'zod'

/** Identifiants fédéraux du club et code postal de ses gymnases. */
export const CLUB = {
  structureId: '983',
  extStructureId: '2244',
  codePostal: '73100',
} as const

export const ORIGINE_FFHB = 'https://www.ffhandball.fr'
const LOGOS_CLUBS = 'https://media-logos-clubs.ffhandball.fr/64'

// ============================================
// Adresses
// ============================================

export interface AdresseFfhb {
  /** Adresse de la compétition, sans barre finale. */
  racine: string
  extPouleId: string | null
  extEquipeId: string | null
}

const MOTIF_CHEMIN =
  /^\/competitions\/(saison-\d{4}-\d{4}-\d+)\/([a-z-]+)\/([a-z0-9-]+)(?:\/(poule|equipe)-(\d+))?(?:\/|$)/

/**
 * Découpe un lien de compétition. Seul le site fédéral est accepté : l'adresse
 * est saisie dans l'admin puis appelée côté serveur.
 */
export function analyserUrl(lien: string): AdresseFfhb | null {
  let url: URL
  try {
    url = new URL(lien.trim())
  } catch {
    return null
  }
  if (url.protocol !== 'https:' || url.hostname !== 'www.ffhandball.fr') return null

  const morceaux = MOTIF_CHEMIN.exec(url.pathname)
  if (!morceaux) return null

  const [, saison, type, competition, genre, identifiant] = morceaux
  return {
    racine: `${ORIGINE_FFHB}/competitions/${saison}/${type}/${competition}`,
    extPouleId: genre === 'poule' ? identifiant : null,
    extEquipeId: genre === 'equipe' ? identifiant : null,
  }
}

export function urlEquipe(racine: string, extEquipeId: string): string {
  return `${racine}/equipe-${extEquipeId}/`
}

/** Même découpage que le site : sans accents, en minuscules, séparé par des tirets. */
export function slugFfhb(libelle: string): string {
  return libelle
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ============================================
// Extraction des blocs
// ============================================

const ENTITES: Record<string, string> = {
  quot: '"',
  amp: '&',
  lt: '<',
  gt: '>',
  apos: "'",
  nbsp: ' ',
}

function decoderHtml(texte: string): string {
  return texte.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entite, code: string) => {
    if (code.startsWith('#')) {
      const hexadecimal = code[1].toLowerCase() === 'x'
      const point = parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10)
      return Number.isInteger(point) && point >= 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : entite
    }
    return ENTITES[code.toLowerCase()] ?? entite
  })
}

export type Composants = Map<string, Record<string, unknown>>

const MOTIF_COMPOSANT = /<smartfire-component\s+name=(['"])([^'"]+)\1\s+attributes="([^"]*)"/g

/** Renvoie les blocs d'une page, indexés par nom. Un bloc illisible est ignoré. */
export function extraireComposants(html: string): Composants {
  const composants: Composants = new Map()
  for (const [, , nom, attributs] of html.matchAll(MOTIF_COMPOSANT)) {
    if (composants.has(nom)) continue
    try {
      const donnees: unknown = JSON.parse(decoderHtml(attributs))
      if (donnees && typeof donnees === 'object' && !Array.isArray(donnees)) {
        composants.set(nom, donnees as Record<string, unknown>)
      }
    } catch {
      // Bloc sans JSON exploitable
    }
  }
  return composants
}

/** Certains champs sont eux-mêmes sérialisés en JSON dans une chaîne. */
function deserialiser(valeur: unknown): unknown {
  if (typeof valeur !== 'string') return valeur
  try {
    return JSON.parse(valeur)
  } catch {
    return valeur
  }
}

// ============================================
// Schémas
// ============================================

const identifiant = z.union([z.string(), z.number()]).transform(String)
const texte = z
  .union([z.string(), z.number()])
  .transform(String)
  .nullish()
  .transform((valeur) => valeur ?? null)

const schemaEquipe = z.object({
  id: identifiant,
  ext_equipeId: identifiant,
  pouleId: texte,
  structureId: texte,
  ext_structureId: texte,
  libelle: texte,
})

const schemaPoule = z.object({
  id: identifiant,
  ext_pouleId: identifiant,
  libelle: texte,
})

const schemaRencontre = z.object({
  ext_rencontreId: identifiant,
  equipe1Id: identifiant,
  equipe2Id: identifiant,
  equipe1Libelle: texte,
  equipe2Libelle: texte,
  equipe1Score: texte,
  equipe2Score: texte,
  date: texte,
  equipementId: texte,
  journeeNumero: texte,
  structure1Logo: texte,
  structure2Logo: texte,
  extPouleId: texte,
})

const schemaClassement = z.object({
  pouleId: texte,
  place: texte,
  point: texte,
  equipe_libelle: texte,
})

const schemaSalle = z.object({
  id: identifiant,
  libelle: texte,
  rue: texte,
  codePostal: texte,
  ville: texte,
})

const schemaCompetition = z.object({
  ext_competitionId: identifiant,
  libelle: z.string(),
})

function lireListe<T>(valeur: unknown, schema: z.ZodType<T>): T[] {
  const liste = deserialiser(valeur)
  if (!Array.isArray(liste)) return []
  return liste.flatMap((element) => {
    const resultat = schema.safeParse(element)
    return resultat.success ? [resultat.data] : []
  })
}

// ============================================
// Modèle
// ============================================

export interface EquipeFfhb {
  id: string
  extEquipeId: string
  pouleId: string | null
  libelle: string
}

export interface RencontreFfhb {
  extRencontreId: string
  extPouleId: string | null
  journee: number | null
  date: Date | null
  equipementId: string | null
  /** Vrai si l'équipe du club est citée en premier (elle reçoit, hors plateau). */
  recoit: boolean
  adversaire: string
  logoAdversaire: string | null
  scoreEquipe: number | null
  scoreAdversaire: number | null
  termine: boolean
}

export interface LigneClassement {
  position: number
  club: string
  points: number
}

export interface CalendrierEquipe {
  /** `null` si le titre de la page est illisible : on ne touche alors pas à l'existant. */
  competition: string | null
  equipe: EquipeFfhb
  rencontres: RencontreFfhb[]
  /** `null` si le bloc est absent ou partiellement illisible : on garde le classement en base. */
  classement: LigneClassement[] | null
}

export interface SalleFfhb {
  id: string
  libelle: string
  rue: string | null
  codePostal: string | null
  ville: string | null
}

// ============================================
// Mise en forme
// ============================================

const PARTICULES = new Set([
  'de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'sur', 'sous', 'au', 'aux', 'à', 'a',
])

function capitaliser(mot: string): string {
  return mot ? mot[0].toUpperCase() + mot.slice(1) : mot
}

function mettreEnFormeMot(mot: string, premier: boolean): string {
  const minuscule = mot.toLowerCase()
  if (!premier && PARTICULES.has(minuscule)) return minuscule
  // « D'AUVERGNE » → « d'Auvergne », « L'ISLE » → « l'Isle »
  const elision = /^([dl])'(.+)$/.exec(minuscule)
  if (elision) return `${premier ? elision[1].toUpperCase() : elision[1]}'${capitaliser(elision[2])}`
  return capitaliser(minuscule)
}

/** « GYMNASE DES PRES RIANTS » → « Gymnase des Pres Riants ». */
export function mettreEnForme(brut: string): string {
  return brut
    .trim()
    .split(/\s+/)
    .map((mot, index) =>
      mot
        .split('-')
        .map((partie, rang) => mettreEnFormeMot(partie, index === 0 && rang === 0))
        .join('-')
    )
    .join(' ')
}

function nettoyer(brut: string | null): string {
  return (brut ?? '').replace(/\s+/g, ' ').trim()
}

/** Clé de comparaison d'un nom d'équipe : casse, accents et espaces ignorés. */
export function cleEquipe(nom: string): string {
  return nom
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
}

function urlLogo(fichier: string | null): string | null {
  if (!fichier) return null
  const base = fichier.replace(/\.[a-z0-9]+$/i, '')
  return /^[A-Za-z0-9._-]+$/.test(base) ? `${LOGOS_CLUBS}/${base}.webp` : null
}

// ============================================
// Scores
// ============================================

function lireScore(brut: string | null): number | 'forfait' | null {
  const valeur = nettoyer(brut).toUpperCase()
  if (!valeur) return null
  if (valeur === 'FO') return 'forfait'
  return /^\d{1,3}$/.test(valeur) ? Number(valeur) : null
}

/**
 * Convertit les deux scores bruts. Un forfait (« FO ») compte zéro but pour
 * l'équipe forfait ; tant qu'un score manque, le match n'est pas terminé.
 */
export function lireScores(
  brutEquipe: string | null,
  brutAdversaire: string | null
): Pick<RencontreFfhb, 'scoreEquipe' | 'scoreAdversaire' | 'termine'> {
  const equipe = lireScore(brutEquipe)
  const adversaire = lireScore(brutAdversaire)
  if (equipe === null || adversaire === null) {
    return { scoreEquipe: null, scoreAdversaire: null, termine: false }
  }
  return {
    scoreEquipe: equipe === 'forfait' ? 0 : equipe,
    scoreAdversaire: adversaire === 'forfait' ? 0 : adversaire,
    termine: true,
  }
}

// ============================================
// Lecture des pages
// ============================================

function versEquipe(brute: z.infer<typeof schemaEquipe>): EquipeFfhb {
  return {
    id: brute.id,
    extEquipeId: brute.ext_equipeId,
    pouleId: brute.pouleId,
    libelle: nettoyer(brute.libelle),
  }
}

/** Équipes du club présentes dans la poule affichée par la page. */
export function equipesDuClub(composants: Composants): EquipeFfhb[] {
  const selecteur = composants.get('competitions---poule-selector')
  return lireListe(selecteur?.equipe_options, schemaEquipe)
    .filter((equipe) => equipe.structureId === CLUB.structureId)
    .map(versEquipe)
}

/** Vrai si le club a au moins une équipe engagée dans la compétition de la page. */
export function clubEngage(composants: Composants): boolean {
  const calendrier = composants.get('competitions---calendar-button')
  return lireListe(calendrier?.equipes, schemaEquipe).some(
    (equipe) => equipe.ext_structureId === CLUB.extStructureId
  )
}

export function poulesDeLaPage(composants: Composants): { extPouleId: string; libelle: string }[] {
  const selecteur = composants.get('competitions---poule-selector')
  return lireListe(selecteur?.poules, schemaPoule).map((poule) => ({
    extPouleId: poule.ext_pouleId,
    libelle: nettoyer(poule.libelle),
  }))
}

export function competitionsDeLaPage(
  composants: Composants
): { extCompetitionId: string; libelle: string }[] {
  const menu = composants.get('competitions---competition-main-menu')
  return lireListe(menu?.competitions, schemaCompetition).map((competition) => ({
    extCompetitionId: competition.ext_competitionId,
    libelle: nettoyer(competition.libelle),
  }))
}

function titreCompetition(composants: Composants): string | null {
  const titre = composants.get('page-header')?.title
  return typeof titre === 'string' && nettoyer(titre) ? mettreEnForme(titre) : null
}

/** Classement de la poule, ou `null` dès qu'une partie du bloc est illisible. */
function lireClassement(composants: Composants, pouleId: string | null): LigneClassement[] | null {
  const brut = deserialiser(composants.get('competitions---mini-classement-or-ads')?.classements)
  if (!Array.isArray(brut)) return null

  const lignes: LigneClassement[] = []
  for (const element of brut) {
    const ligne = schemaClassement.safeParse(element)
    if (!ligne.success) return null
    if (pouleId && ligne.data.pouleId && ligne.data.pouleId !== pouleId) continue
    const club = nettoyer(ligne.data.equipe_libelle)
    if (!club || !/^[1-9]\d*$/.test(ligne.data.place ?? '') || !/^-?\d+$/.test(ligne.data.point ?? '')) {
      return null
    }
    lignes.push({ position: Number(ligne.data.place), club, points: Number(ligne.data.point) })
  }
  return lignes
}

const formatHeureParis = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Paris',
  hourCycle: 'h23',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Date d'une rencontre, ou `null` si elle n'est pas réellement fixée : la
 * fédération met minuit (souvent au 31 décembre) sur un match à reprogrammer.
 */
export function lireDate(brute: string | null): Date | null {
  // Sans décalage explicite, l'heure dépendrait du fuseau de la machine
  if (!brute || !/(?:Z|[+-]\d{2}:?\d{2})$/.test(brute.trim())) return null
  const date = new Date(brute.trim())
  if (Number.isNaN(date.getTime())) return null
  return formatHeureParis.format(date) === '00:00' ? null : date
}

function versRencontre(
  brute: z.infer<typeof schemaRencontre>,
  idEquipe: string
): RencontreFfhb {
  const recoit = brute.equipe1Id === idEquipe
  const date = lireDate(brute.date)
  const journee = Number(brute.journeeNumero)

  return {
    extRencontreId: brute.ext_rencontreId,
    extPouleId: brute.extPouleId,
    journee: brute.journeeNumero && Number.isInteger(journee) ? journee : null,
    date,
    equipementId: brute.equipementId,
    recoit,
    adversaire: nettoyer(recoit ? brute.equipe2Libelle : brute.equipe1Libelle),
    logoAdversaire: urlLogo(recoit ? brute.structure2Logo : brute.structure1Logo),
    ...lireScores(
      recoit ? brute.equipe1Score : brute.equipe2Score,
      recoit ? brute.equipe2Score : brute.equipe1Score
    ),
  }
}

/**
 * Lit la page « équipe » d'une compétition. La page liste les rencontres de
 * toutes les équipes du club engagées dans la compétition : on ne garde que
 * celles de l'équipe demandée.
 */
export function lireCalendrierEquipe(
  composants: Composants,
  extEquipeIdAttendu?: string
): CalendrierEquipe {
  const selecteur = composants.get('competitions---poule-selector')
  const selection = schemaEquipe.safeParse(deserialiser(selecteur?.selected_equipe))
  if (!selection.success) {
    throw new Error("La page FFHandball ne désigne aucune équipe : le lien n'est plus valable")
  }
  if (extEquipeIdAttendu && selection.data.ext_equipeId !== extEquipeIdAttendu) {
    throw new Error("La page FFHandball affiche une autre équipe que celle du lien : le lien n'est plus valable")
  }
  if (selection.data.structureId !== CLUB.structureId) {
    throw new Error(
      `Le lien pointe vers une équipe d'un autre club (${nettoyer(selection.data.libelle) || 'inconnue'})`
    )
  }
  const equipe = versEquipe(selection.data)

  const liste = composants.get('competitions---rencontre-list')
  if (!Array.isArray(deserialiser(liste?.rencontres))) {
    throw new Error('La page FFHandball ne contient pas la liste des rencontres')
  }
  const rencontres = lireListe(liste?.rencontres, schemaRencontre)
    .filter((brute) => brute.equipe1Id === equipe.id || brute.equipe2Id === equipe.id)
    .map((brute) => versRencontre(brute, equipe.id))
    .filter((rencontre) => rencontre.adversaire.length > 0)

  return {
    competition: titreCompetition(composants),
    equipe,
    rencontres,
    classement: lireClassement(composants, equipe.pouleId),
  }
}

/** Lit la salle sur la page détail d'une rencontre. */
export function lireSalle(composants: Composants): SalleFfhb | null {
  return validerSalle(deserialiser(composants.get('competitions---rencontre-salle')?.equipement))
}

/** Valide une salle venue de la fédération ou relue depuis le cache. */
export function validerSalle(brute: unknown): SalleFfhb | null {
  const salle = schemaSalle.safeParse(brute)
  if (!salle.success || !nettoyer(salle.data.libelle)) return null
  return {
    id: salle.data.id,
    libelle: nettoyer(salle.data.libelle),
    rue: nettoyer(salle.data.rue) || null,
    codePostal: nettoyer(salle.data.codePostal) || null,
    ville: nettoyer(salle.data.ville) || null,
  }
}

// ============================================
// Conversion vers un match de l'application
// ============================================

export const LIEU_INCONNU = 'À déterminer'

const GYMNASES_DU_CLUB: { motif: RegExp; libelle: string }[] = [
  { motif: /marlioz/i, libelle: 'Gymnase de Marlioz' },
  { motif: /pr[eé]s?[\s-]*riants?/i, libelle: 'Gymnase des Prés Riants' },
]

/** Nom affichable d'une salle ; les deux gymnases du club ont un nom fixe. */
export function libelleSalle(salle: SalleFfhb): string {
  const gymnase = GYMNASES_DU_CLUB.find(({ motif }) => motif.test(salle.libelle))
  if (gymnase) return gymnase.libelle
  const nom = mettreEnForme(salle.libelle)
  return salle.ville ? `${nom}, ${mettreEnForme(salle.ville)}` : nom
}

/** Vrai si la salle est l'un des gymnases d'Aix-les-Bains. */
export function estSalleDuClub(salle: SalleFfhb): boolean {
  if (salle.codePostal !== CLUB.codePostal) return false
  // « Aix-les-Bains », pas « Grésy-sur-Aix » ni « Tresserve », qui partagent le code postal
  return !salle.ville || /^aix\b/i.test(salle.ville.trim())
}

export interface MatchSynchronise {
  /** Identifiant fédéral de la rencontre : c'est lui qui relie le match à la base. */
  extRencontreId: string
  adversaire: string
  date: Date
  lieu: string
  domicile: boolean
  /** Faux quand le domicile est une valeur de repli (plateau dont la salle est inconnue). */
  domicileFiable: boolean
  competition: string | null
  scoreEquipe: number | null
  scoreAdversaire: number | null
  termine: boolean
  logoAdversaire: string | null
}

/**
 * Convertit une rencontre datée en match.
 *
 * En plateau (moins de 11, moins de 9), l'ordre des équipes ne dit rien du
 * lieu : on joue à domicile quand la salle est à Aix-les-Bains. Les scores n'y
 * sont pas comptés et la fédération affiche « 1 - 1 » une fois le match joué :
 * on garde alors « joué » sans score.
 */
export function versMatch(
  rencontre: RencontreFfhb & { date: Date },
  salle: SalleFfhb | null,
  competition: string | null,
  plateau: boolean
): MatchSynchronise {
  const salleLocalisee = salle?.codePostal ? salle : null
  const domicile = plateau && salleLocalisee ? estSalleDuClub(salleLocalisee) : rencontre.recoit

  const scoreFictif =
    plateau &&
    rencontre.termine &&
    rencontre.scoreEquipe === rencontre.scoreAdversaire &&
    (rencontre.scoreEquipe ?? 0) <= 1

  return {
    extRencontreId: rencontre.extRencontreId,
    adversaire: rencontre.adversaire,
    date: rencontre.date,
    lieu: salle ? libelleSalle(salle) : LIEU_INCONNU,
    domicile,
    domicileFiable: !plateau || salleLocalisee !== null,
    competition,
    scoreEquipe: scoreFictif ? null : rencontre.scoreEquipe,
    scoreAdversaire: scoreFictif ? null : rencontre.scoreAdversaire,
    termine: rencontre.termine,
    logoAdversaire: rencontre.logoAdversaire,
  }
}

const UN_JOUR = 24 * 60 * 60 * 1000

/**
 * Retrouve le match déjà en base.
 *
 * 1. Le match déjà relié à cette rencontre fédérale, quels que soient sa date
 *    et son adversaire : un report ou un changement de nom ne crée pas de doublon.
 * 2. Sinon, un match pas encore relié (saisi à la main, ou d'avant l'identifiant) :
 *    même adversaire, à moins d'un jour d'écart, le plus proche l'emporte.
 *
 * `dejaPris` évite d'associer deux fois le même match.
 */
export function trouverExistant<
  T extends { id: number; adversaire: string; date: Date; extRencontreId: string | null },
>(
  existants: T[],
  match: Pick<MatchSynchronise, 'adversaire' | 'date' | 'extRencontreId'>,
  dejaPris: Set<number>
): T | null {
  const relie = existants.find((existant) => existant.extRencontreId === match.extRencontreId)
  if (relie) return dejaPris.has(relie.id) ? null : relie

  const cle = cleEquipe(match.adversaire)
  let meilleur: T | null = null
  let meilleurEcart = Infinity

  for (const existant of existants) {
    // Un match relié à une autre rencontre fédérale n'est jamais réattribué
    if (existant.extRencontreId !== null) continue
    if (dejaPris.has(existant.id) || cleEquipe(existant.adversaire) !== cle) continue
    const ecart = Math.abs(existant.date.getTime() - match.date.getTime())
    if (ecart <= UN_JOUR && ecart < meilleurEcart) {
      meilleur = existant
      meilleurEcart = ecart
    }
  }
  return meilleur
}
