'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, Trophy } from 'lucide-react'
import { SectionHeader } from '@/components/site/SectionHeader'
import { container, sitePill } from '@/components/site/styles'
import { TeamCrest } from '@/components/matches/TeamCrest'
import { formatMatchDay, formatMatchTime } from '@/lib/match-format'
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

interface Team {
  id: number
  nom: string
  slug: string
  categorie: string
  genre: string
  photo: string | null
  featured: boolean
  matchs: Match[]
}

interface UpcomingMatchesProps {
  teams: Team[]
}

type FilterType = 'featured' | 'masculin' | 'feminin'

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'featured', label: 'À la une' },
  { value: 'masculin', label: 'Masculins' },
  { value: 'feminin', label: 'Féminines' },
]

export function UpcomingMatches({ teams }: UpcomingMatchesProps) {
  const [filter, setFilter] = useState<FilterType>('featured')

  if (teams.length === 0) {
    return null
  }

  const displayedTeams = teams.filter((team) =>
    filter === 'featured' ? team.featured : filter === 'masculin' ? team.genre === 'MASCULIN' : team.genre === 'FEMININ'
  )

  return (
    <section className="relative isolate overflow-hidden border-y border-white/10 bg-neutral-900 py-20 md:py-28">
      <div aria-hidden className="absolute inset-0 -z-10 bg-stripes" />

      <div className={container}>
        <SectionHeader
          eyebrow="Ce week-end à domicile"
          title="Venez nous encourager"
          description="Les matchs de nos équipes à la maison. Entrée libre, ambiance garantie !"
          action={
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les équipes">
              {FILTERS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  aria-pressed={filter === option.value}
                  className={sitePill({ active: filter === option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          }
        />

        {displayedTeams.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayedTeams.map((team) =>
              team.matchs[0] ? <WeekendMatchCard key={team.id} team={team} match={team.matchs[0]} /> : null
            )}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-white/15 px-6 py-12 text-center text-neutral-400">
            Aucun match à domicile ce week-end pour cette sélection.
          </p>
        )}
      </div>
    </section>
  )
}

function WeekendMatchCard({ team, match }: { team: Team; match: Match }) {
  return (
    <li>
      <Link
        href={`/equipes/${team.slug}`}
        className="group flex h-full flex-col rounded-xl border border-white/10 bg-neutral-950/70 p-5 transition-colors hover:border-primary-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-white">{team.nom}</p>
            <p className="text-sm text-neutral-500">{team.categorie}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-headline text-2xl text-primary-400">{formatMatchTime(match.date)}</p>
            <p className="text-xs font-medium capitalize text-neutral-400">{formatMatchDay(match.date)}</p>
          </div>
        </div>

        <div className="my-6 flex items-center justify-center gap-5">
          <TeamCrest name="HBC Aix-en-Savoie" isHbc size="lg" />
          <span className="font-headline text-xl text-neutral-600">VS</span>
          <TeamCrest name={match.adversaire} logo={match.logoAdversaire} size="lg" />
        </div>
        <p className="text-center font-semibold text-white">{match.adversaire}</p>

        <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm text-neutral-400">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary-500" />
            {match.lieu}
          </p>
          {match.competition && (
            <p className="flex items-center gap-2">
              <Trophy className="size-4 shrink-0 text-primary-500" />
              {match.competition}
            </p>
          )}
        </div>

        <span
          className={cn(
            'mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-400 transition-colors group-hover:text-primary-300'
          )}
        >
          Voir l&apos;équipe
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </li>
  )
}
