/**
 * Dates de la section Inscriptions, toujours à l'heure du club : le serveur et
 * le navigateur rendent ainsi le même texte, où qu'ils tournent.
 */
const FUSEAU_CLUB = 'Europe/Paris'

const jour = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

const heure = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  hour: '2-digit',
  minute: '2-digit',
})

const dateCourte = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU_CLUB,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** « sam. 14 nov. » */
export function formatJour(date: Date | string) {
  return jour.format(new Date(date))
}

/** « 19:30 » */
export function formatHeure(date: Date | string) {
  return heure.format(new Date(date))
}

/** « 14 nov. 2026 » */
export function formatDateCourte(date: Date | string) {
  return dateCourte.format(new Date(date))
}

export function pluriel(nombre: number, singulier: string, plurielle: string) {
  return nombre > 1 ? plurielle : singulier
}
