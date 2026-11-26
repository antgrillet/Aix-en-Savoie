/**
 * Dates relatives de l'admin, toujours à l'heure du club. Calculées côté
 * serveur au rendu de la page (l'admin est dynamique) : le texte ne bouge pas
 * à l'hydratation.
 */
const FUSEAU_CLUB = 'Europe/Paris'

const jourCourt = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const jourAnnee = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const heure = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  hour: '2-digit',
  minute: '2-digit',
})

const jourCle = new Intl.DateTimeFormat('fr-CA', {
  timeZone: FUSEAU_CLUB,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const MINUTE = 60 * 1000
const HEURE = 60 * MINUTE

/** Écart en jours calendaires (heure de Paris) entre deux instants. */
export function joursEntre(avant: Date, apres: Date): number {
  const a = Date.parse(`${jourCle.format(avant)}T00:00:00Z`)
  const b = Date.parse(`${jourCle.format(apres)}T00:00:00Z`)
  return Math.round((b - a) / (24 * HEURE))
}

/** « à l'instant », « il y a 12 min », « il y a 3 h », « hier à 07:00 », « il y a 4 j », « le sam. 14 nov. » */
export function ilYa(date: Date, maintenant: Date): string {
  const ecart = maintenant.getTime() - date.getTime()
  if (ecart < MINUTE) return "à l'instant"
  if (ecart < HEURE) return `il y a ${Math.floor(ecart / MINUTE)} min`
  const jours = joursEntre(date, maintenant)
  if (jours === 0) return `il y a ${Math.floor(ecart / HEURE)} h`
  if (jours === 1) return `hier à ${heure.format(date)}`
  if (jours < 7) return `il y a ${jours} j`
  // Au-delà de dix mois, le jour de la semaine ne suffit plus : l'année le dit
  if (jours > 300) return `le ${jourAnnee.format(date)}`
  return `le ${jourCourt.format(date)}`
}

/** Échéance à venir : « aujourd'hui 19:00 », « demain 13:00 », « sam. 28 nov. 13:00 » */
export function echeance(date: Date, maintenant: Date): string {
  const jours = joursEntre(maintenant, date)
  if (jours === 0) return `aujourd'hui ${heure.format(date)}`
  if (jours === 1) return `demain ${heure.format(date)}`
  return `${jourCourt.format(date)} ${heure.format(date)}`
}

/** « sam. 28 nov. » */
export function formatJourCourt(date: Date): string {
  return jourCourt.format(date)
}

/** « 19:30 » */
export function formatHeure(date: Date): string {
  return heure.format(date)
}

export function pluriel(nombre: number, singulier: string, plurielle: string): string {
  return nombre > 1 ? plurielle : singulier
}
