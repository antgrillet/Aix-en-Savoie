/**
 * Règles des notes d'arbitrage, partagées entre le formulaire public, l'API,
 * l'admin et le PDF. Aucun import serveur : ce fichier part aussi dans le
 * navigateur.
 *
 * Les montants sont des centimes entiers : aucun arrondi flottant ne doit
 * changer un total entre l'écran, la base et le PDF.
 */

/** Barème kilométrique proposé tant que le bureau n'en a pas fixé un. */
export const BAREME_KM_DEFAUT_CENTIMES = 32
export const EMAIL_COMPTABLE_DEFAUT = 'comptabilite@hbcaixensavoie.fr'
export const EMAIL_CLUB = 'contact@hbcaixensavoie.fr'
export const CLE_BAREME_KM = 'arbitrage_bareme_km'
export const CLE_EMAIL_COMPTABLE = 'arbitrage_email_comptable'

/** Bornes des frais : au-delà, c'est une faute de frappe. */
export const MAX_INDEMNITE_CENTIMES = 100_000 // 1 000 €
export const MAX_FRAIS_ANNEXES_CENTIMES = 50_000 // 500 €
export const MAX_KILOMETRES = 2_000
export const MAX_BAREME_KM_CENTIMES = 200 // 2 €/km

/** Justificatifs : la requête entière doit rester sous la limite de Vercel (4,5 Mo). */
export const MAX_JUSTIFICATIFS = 5
export const MAX_TAILLE_JUSTIFICATIF = 3 * 1024 * 1024
export const MAX_TAILLE_TOTALE_JUSTIFICATIFS = 4 * 1024 * 1024
export const TYPES_JUSTIFICATIF = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const
export type TypeJustificatif = (typeof TYPES_JUSTIFICATIF)[number]

/** Signature dessinée : un PNG de quelques dizaines de Ko suffit largement. */
export const MAX_TAILLE_SIGNATURE = 400 * 1024

// ---------------------------------------------------------------------------
// Montants
// ---------------------------------------------------------------------------

/**
 * « 12 », « 12,5 », « 12.50 » → 1250. Vide → 0. Rien d'autre n'est accepté
 * (pas de signe, pas plus de deux décimales) : renvoie `null`.
 */
export function eurosEnCentimes(saisie: string): number | null {
  const texte = saisie.trim().replace(/\s/g, '')
  if (texte === '') return 0
  const m = /^(\d{1,6})(?:[.,](\d{1,2}))?$/.exec(texte)
  if (!m) return null
  const centimes = (m[2] ?? '').padEnd(2, '0')
  return Number(m[1]) * 100 + Number(centimes)
}

/** 1250 → « 12,50 » (sans symbole, pour remplir un champ). */
export function centimesEnSaisie(centimes: number): string {
  const euros = Math.floor(centimes / 100)
  const reste = String(centimes % 100).padStart(2, '0')
  return `${euros},${reste}`
}

const formatEuros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

/** 1250 → « 12,50 € » (espaces insécables de Intl). */
export function formatCentimes(centimes: number): string {
  return formatEuros.format(centimes / 100)
}

/** 32 → « 0,32 €/km » */
export function formatBareme(centimesParKm: number): string {
  return `${formatCentimes(centimesParKm)}/km`
}

export interface FraisArbitrage {
  indemniteCentimes: number
  kilometres: number
  baremeKmCentimes: number
  fraisAnnexesCentimes: number
}

export function fraisKilometriques(frais: Pick<FraisArbitrage, 'kilometres' | 'baremeKmCentimes'>): number {
  return frais.kilometres * frais.baremeKmCentimes
}

export function totalCentimes(frais: FraisArbitrage): number {
  return frais.indemniteCentimes + fraisKilometriques(frais) + frais.fraisAnnexesCentimes
}

/** Lit un réglage de barème (« 0,32 » ou « 0.32 ») ; invalide → barème par défaut. */
export function lireBareme(valeur: string | null | undefined): number {
  if (!valeur) return BAREME_KM_DEFAUT_CENTIMES
  const centimes = eurosEnCentimes(valeur)
  if (centimes === null || centimes <= 0 || centimes > MAX_BAREME_KM_CENTIMES) {
    return BAREME_KM_DEFAUT_CENTIMES
  }
  return centimes
}

// ---------------------------------------------------------------------------
// Coordonnées bancaires
// ---------------------------------------------------------------------------

/** Retire espaces et tirets, passe en capitales. */
export function nettoyerIban(saisie: string): string {
  return saisie.replace(/[\s-]/g, '').toUpperCase()
}

/** « FR7630006000011234567890189 » → « FR76 3000 6000 0112 3456 7890 189 » */
export function formaterIban(iban: string): string {
  return nettoyerIban(iban).replace(/(.{4})/g, '$1 ').trim()
}

/** Contrôle ISO 13616 : format, puis clé modulo 97. */
export function ibanValide(saisie: string): boolean {
  const iban = nettoyerIban(saisie)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false
  // France et Monaco : 27 caractères exactement
  if ((iban.startsWith('FR') || iban.startsWith('MC')) && iban.length !== 27) return false
  const reordonne = iban.slice(4) + iban.slice(0, 4)
  let reste = 0
  for (const caractere of reordonne) {
    const code = caractere.charCodeAt(0)
    const valeur = code >= 65 ? String(code - 55) : caractere
    for (const chiffre of valeur) {
      reste = (reste * 10 + Number(chiffre)) % 97
    }
  }
  return reste === 1
}

export function bicValide(saisie: string): boolean {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(saisie.trim().toUpperCase())
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** Aujourd'hui à Aix-les-Bains, au format AAAA-MM-JJ. */
export function aujourdhuiParis(maintenant: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(maintenant)
}

/** Ajoute des jours à une date AAAA-MM-JJ, sans passer par le fuseau local. */
export function decalerJour(jour: string, jours: number): string {
  const date = new Date(`${jour}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + jours)
  return date.toISOString().slice(0, 10)
}

/** Une vraie date du calendrier (refuse le 31 février). */
export function jourValide(jour: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(jour)) return false
  const date = new Date(`${jour}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === jour
}

/** Une note se rapporte à un match joué dans l'année, au plus tard aujourd'hui. */
export const ANCIENNETE_MAX_JOURS = 365

const formatJourLong = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const formatJourCourt = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'UTC',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** Une date de match stockée en `@db.Date` (minuit UTC) → « samedi 22 novembre 2026 ». */
export function formatDateMatch(date: Date, court = false): string {
  return (court ? formatJourCourt : formatJourLong).format(date)
}

// ---------------------------------------------------------------------------
// Référence et justificatifs
// ---------------------------------------------------------------------------

/** ARB-2026-0042 : l'année de dépôt et le numéro de la note. */
export function referenceNote(note: { id: number; createdAt: Date }): string {
  const annee = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric' }).format(
    note.createdAt
  )
  return `ARB-${annee}-${String(note.id).padStart(4, '0')}`
}

/** Le vrai type d'un fichier, lu dans ses premiers octets (jamais dans son nom). */
export function detecterTypeJustificatif(octets: Uint8Array): TypeJustificatif | null {
  const commence = (...signature: number[]) => signature.every((octet, i) => octets[i] === octet)
  if (commence(0xff, 0xd8, 0xff)) return 'image/jpeg'
  if (commence(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png'
  if (
    commence(0x52, 0x49, 0x46, 0x46) &&
    octets[8] === 0x57 &&
    octets[9] === 0x45 &&
    octets[10] === 0x42 &&
    octets[11] === 0x50
  ) {
    return 'image/webp'
  }
  if (commence(0x25, 0x50, 0x44, 0x46, 0x2d)) return 'application/pdf'
  return null
}

const EXTENSIONS: Record<TypeJustificatif, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

/** Un nom de fichier sûr (en-tête HTTP, pièce jointe), avec la bonne extension. */
export function nomFichierSur(nom: string, type: TypeJustificatif): string {
  const base = nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\.[^.]*$/, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${base || 'justificatif'}.${EXTENSIONS[type]}`
}

export function formatTaille(octets: number): string {
  if (octets < 1024) return `${octets} o`
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`
  return `${(octets / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`
}

export const LIBELLES_STATUT = {
  EN_ATTENTE: 'À valider',
  VALIDEE: 'Validée',
  REFUSEE: 'Refusée',
} as const
