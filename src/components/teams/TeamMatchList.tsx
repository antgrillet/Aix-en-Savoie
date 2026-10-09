import { MapPin } from 'lucide-react'
import { TeamCrest } from '@/components/matches/TeamCrest'
import { siteCard } from '@/components/site/styles'
import { formatMatchDay, formatMatchTime, getMatchOutcome, OUTCOME_LABELS } from '@/lib/match-format'
import { cn } from '@/lib/utils'

interface Match {
  id: number
  adversaire: string
  date: Date
  lieu: string
  domicile: boolean
  competition: string | null
  scoreEquipe: number | null
  scoreAdversaire: number | null
  termine: boolean
  logoAdversaire: string | null
}

interface TeamMatchListProps {
  matches: Match[]
  /** Matchs à venir : heure et lieu mis en avant, pas de score */
  upcoming?: boolean
}

interface Side {
  name: string
  logo: string | null
  isHbc: boolean
}

const badge = 'shrink-0 rounded-sm px-1.5 py-0.5 font-eyebrow text-[0.6rem]'

function TeamSide({ team, reverse }: { team: Side; reverse?: boolean }) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col items-center gap-1.5 text-center md:gap-3',
        reverse ? 'md:flex-row-reverse md:text-right' : 'md:flex-row md:text-left'
      )}
    >
      <TeamCrest name={team.name} logo={team.logo} isHbc={team.isHbc} size="sm" />
      <span
        className={cn(
          'line-clamp-2 text-xs font-semibold leading-tight md:text-sm',
          team.isHbc ? 'text-white' : 'text-neutral-300'
        )}
      >
        {team.isHbc ? 'HBC Aix' : team.name}
      </span>
    </div>
  )
}

function MatchRow({ match, upcoming }: { match: Match; upcoming: boolean }) {
  const hbc: Side = { name: 'HBC Aix-en-Savoie', logo: null, isHbc: true }
  const opponent: Side = { name: match.adversaire, logo: match.logoAdversaire, isHbc: false }
  const [home, away] = match.domicile ? [hbc, opponent] : [opponent, hbc]
  const [homeScore, awayScore] = match.domicile
    ? [match.scoreEquipe, match.scoreAdversaire]
    : [match.scoreAdversaire, match.scoreEquipe]
  const outcome = upcoming ? null : getMatchOutcome(match.scoreEquipe, match.scoreAdversaire)
  const hasScore = homeScore !== null && awayScore !== null

  return (
    <li className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[10.5rem_minmax(0,1fr)_5.5rem] md:items-center md:gap-6">
      {/* Date et statut (une seule ligne sur mobile) */}
      <div className="flex items-start justify-between gap-3 md:contents">
        <div className="min-w-0 md:order-1">
          <p className="text-sm font-semibold capitalize text-white">{formatMatchDay(match.date)}</p>
          <p className="text-xs text-neutral-500">
            {formatMatchTime(match.date)}
            {match.competition && <> · {match.competition}</>}
          </p>
          {upcoming && match.lieu && (
            <p className="mt-1 flex items-start gap-1 text-xs text-neutral-500">
              <MapPin className="mt-px size-3 shrink-0 text-primary-500" aria-hidden />
              <span className="line-clamp-2">{match.lieu}</span>
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 md:order-3 md:flex-col md:items-end">
          <span
            className={cn(
              badge,
              match.domicile ? 'bg-primary-500/15 text-primary-300' : 'bg-white/10 text-neutral-300'
            )}
          >
            {match.domicile ? 'Domicile' : 'Extérieur'}
          </span>
          {outcome && (
            <span
              className={cn(
                badge,
                outcome === 'win' && 'bg-emerald-500/15 text-emerald-300',
                outcome === 'loss' && 'bg-red-500/15 text-red-300',
                outcome === 'draw' && 'bg-white/10 text-neutral-300'
              )}
            >
              {OUTCOME_LABELS[outcome]}
            </span>
          )}
        </div>
      </div>

      {/* Affiche : domicile à gauche, extérieur à droite */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 md:order-2 md:gap-5">
        <TeamSide team={home} reverse />
        {upcoming ? (
          <span className="px-1 font-headline text-lg text-neutral-600">VS</span>
        ) : hasScore ? (
          <p className="whitespace-nowrap font-headline text-2xl tabular-nums text-white md:text-3xl">
            {homeScore}
            <span className="mx-1.5 text-neutral-600">–</span>
            {awayScore}
          </p>
        ) : (
          <span className="px-1 text-xs text-neutral-500">Score à venir</span>
        )}
        <TeamSide team={away} />
      </div>
    </li>
  )
}

/** Liste de matchs d'une équipe (calendrier ou résultats) */
export function TeamMatchList({ matches, upcoming = false }: TeamMatchListProps) {
  return (
    <ul className={cn(siteCard, 'divide-y divide-white/10 overflow-hidden')}>
      {matches.map((match) => (
        <MatchRow key={match.id} match={match} upcoming={upcoming} />
      ))}
    </ul>
  )
}
