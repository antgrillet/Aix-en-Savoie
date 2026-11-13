/**
 * Dates affichées sur le site public.
 *
 * Le serveur tourne en UTC : sans fuseau explicite, un match de 20h30 s'affiche
 * 19h30. Tout formatage côté serveur passe donc par ce module.
 */
export const FUSEAU_CLUB = 'Europe/Paris'

const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU_CLUB, ...options }).format(date)

/** « SAM. 14 NOV. » */
export const formatJourCourt = (date: Date) =>
  format(date, { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()

/** « 20:30 » */
export const formatHeure = (date: Date) => format(date, { hour: '2-digit', minute: '2-digit' })

/** « 14 novembre 2026 » */
export const formatDateLongue = (date: Date) =>
  format(date, { day: 'numeric', month: 'long', year: 'numeric' })

/** « 14 novembre » */
export const formatJourMois = (date: Date) => format(date, { day: 'numeric', month: 'long' })

/** « sam. 14 nov., 20:30 » */
export const formatDateHeure = (date: Date) =>
  format(date, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/** « 14/11 » */
export const formatJourMoisChiffres = (date: Date) => format(date, { day: '2-digit', month: '2-digit' })

/** Année, mois (1-12), jour et jour de la semaine (0 = dimanche) à Paris. */
function partiesParis(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSEAU_CLUB,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date)
  const lire = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    annee: Number(lire('year')),
    mois: Number(lire('month')),
    jour: Number(lire('day')),
    jourSemaine: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(lire('weekday')),
  }
}

/** Décalage de Paris par rapport à UTC, en millisecondes, à l'instant donné. */
function decalageParis(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSEAU_CLUB,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)
  const lire = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const commeUtc = Date.UTC(
    lire('year'),
    lire('month') - 1,
    lire('day'),
    lire('hour'),
    lire('minute'),
    lire('second')
  )
  return commeUtc - Math.floor(instant.getTime() / 1000) * 1000
}

/** Instant correspondant à minuit, heure de Paris, pour une date civile. */
function minuitParis(annee: number, mois: number, jour: number): Date {
  const approx = Date.UTC(annee, mois - 1, jour)
  const premier = new Date(approx - decalageParis(new Date(approx)))
  // Second passage pour les nuits de changement d'heure.
  return new Date(approx - decalageParis(premier))
}

/**
 * Week-end à afficher : du vendredi 00:00 au dimanche 23:59:59, heure de Paris.
 * Du lundi au vendredi, c'est le week-end qui vient ; le samedi et le dimanche,
 * celui en cours.
 */
export function bornesWeekend(maintenant: Date): { debut: Date; fin: Date } {
  const { annee, mois, jour, jourSemaine } = partiesParis(maintenant)
  const versVendredi = jourSemaine === 6 ? -1 : jourSemaine === 0 ? -2 : 5 - jourSemaine
  const debut = minuitParis(annee, mois, jour + versVendredi)
  const lundi = minuitParis(annee, mois, jour + versVendredi + 3)
  return { debut, fin: new Date(lundi.getTime() - 1) }
}
