import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { TeamCrest } from '@/components/matches/TeamCrest'
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
  equipe: {
    nom: string
    categorie: string
  }
}

interface FeaturedMatchesProps {
  upcomingMatches: Match[]
  lastResults: Match[]
}

function TeamSide({ team }: { team: { name: string; logo: string | null; isHbc: boolean } }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <TeamCrest name={team.name} logo={team.logo} isHbc={team.isHbc} size="sm" />
      <span className={cn('line-clamp-2 text-xs font-semibold leading-tight', team.isHbc ? 'text-white' : 'text-neutral-300')}>
        {team.isHbc ? 'HBC Aix' : team.name}
      </span>
    </div>
  )
}

function MatchRow({ match, upcoming }: { match: Match; upcoming: boolean }) {
  const hbc = { name: match.equipe.nom, logo: null, isHbc: true }
  const opponent = { name: match.adversaire, logo: match.logoAdversaire, isHbc: false }
  const [home, away] = match.domicile ? [hbc, opponent] : [opponent, hbc]
  const [homeScore, awayScore] = match.domicile
    ? [match.scoreEquipe, match.scoreAdversaire]
    : [match.scoreAdversaire, match.scoreEquipe]
  const outcome = upcoming ? null : getMatchOutcome(match.scoreEquipe, match.scoreAdversaire)

  return (
    <li className="rounded-lg border border-white/10 bg-neutral-950/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs">
        <span className="truncate font-semibold text-neutral-300">{match.equipe.nom}</span>
        {upcoming ? (
          <span
            className={cn(
              'shrink-0 rounded-sm px-1.5 py-0.5 font-eyebrow text-[0.6rem]',
              match.domicile ? 'bg-primary-500/15 text-primary-300' : 'bg-white/10 text-neutral-300'
            )}
          >
            {match.domicile ? 'Domicile' : 'Extérieur'}
          </span>
        ) : (
          outcome && (
            <span
              className={cn(
                'shrink-0 rounded-sm px-1.5 py-0.5 font-eyebrow text-[0.6rem]',
                outcome === 'win' && 'bg-emerald-500/15 text-emerald-300',
                outcome === 'loss' && 'bg-red-500/15 text-red-300',
                outcome === 'draw' && 'bg-white/10 text-neutral-300'
              )}
            >
              {OUTCOME_LABELS[outcome]}
            </span>
          )
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamSide team={home} />

        {upcoming ? (
          <div className="text-center">
            <p className="font-headline text-xl text-primary-400">{formatMatchTime(match.date)}</p>
            <p className="text-[0.7rem] font-medium capitalize text-neutral-400">{formatMatchDay(match.date)}</p>
          </div>
        ) : (
          <p className="whitespace-nowrap font-headline text-3xl tabular-nums text-white">
            {homeScore}
            <span className="mx-1.5 text-neutral-600">–</span>
            {awayScore}
          </p>
        )}

        <TeamSide team={away} />
      </div>
    </li>
  )
}

export function FeaturedMatches({ upcomingMatches, lastResults }: FeaturedMatchesProps) {
  const results = lastResults.filter((m) => m.scoreEquipe !== null && m.scoreAdversaire !== null).slice(0, 2)
  const upcoming = upcomingMatches.slice(0, 2)

  if (upcoming.length === 0 && results.length === 0) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900/70 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-headline text-2xl text-white">Nos matchs</h2>
        <Link
          href="/equipes"
          className="group inline-flex items-center gap-1 rounded-sm text-sm font-semibold text-primary-400 transition-colors hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Tout voir
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {upcoming.length > 0 && (
        <div>
          <h3 className="mb-3 font-eyebrow text-[0.7rem] text-neutral-500">À venir</h3>
          <ul className="space-y-2.5">
            {upcoming.map((match) => (
              <MatchRow key={match.id} match={match} upcoming />
            ))}
          </ul>
        </div>
      )}

      {results.length > 0 && (
        <div className={cn(upcoming.length > 0 && 'mt-6')}>
          <h3 className="mb-3 font-eyebrow text-[0.7rem] text-neutral-500">Derniers résultats</h3>
          <ul className="space-y-2.5">
            {results.map((match) => (
              <MatchRow key={match.id} match={match} upcoming={false} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
