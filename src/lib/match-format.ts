// Formats d'affichage des matchs (heure de Paris, quel que soit le serveur)

const TIME_ZONE = 'Europe/Paris'

export function formatMatchDay(date: Date | string) {
  return new Date(date)
    .toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TIME_ZONE })
    .replace(/\./g, '')
}

export function formatMatchTime(date: Date | string) {
  return new Date(date)
    .toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE })
    .replace(':', 'h')
}

export type MatchOutcome = 'win' | 'loss' | 'draw'

export function getMatchOutcome(scoreEquipe: number | null, scoreAdversaire: number | null): MatchOutcome | null {
  if (scoreEquipe === null || scoreAdversaire === null) return null
  if (scoreEquipe > scoreAdversaire) return 'win'
  if (scoreEquipe < scoreAdversaire) return 'loss'
  return 'draw'
}

export const OUTCOME_LABELS: Record<MatchOutcome, string> = {
  win: 'Victoire',
  loss: 'Défaite',
  draw: 'Nul',
}

/** Date/heure à Paris pour les rendus serveur (le serveur tourne en UTC) */
export function formatParis(date: Date | string, options: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleString('fr-FR', { ...options, timeZone: TIME_ZONE })
}
