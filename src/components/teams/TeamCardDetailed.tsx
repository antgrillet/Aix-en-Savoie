import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Clock, User } from 'lucide-react'
import { TeamCrest } from '@/components/matches/TeamCrest'
import { formatMatchDay, formatMatchTime } from '@/lib/match-format'
import { cn, normalizeImagePath } from '@/lib/utils'
import { getCategoryLabel, isClubRow, rankSuffix } from './categories'

interface Entrainement {
  id: number
  jour: string
  horaire: string
  lieu?: string | null
}

interface Classement {
  id: number
  position: number
  club: string
  points: number
}

interface Match {
  id: number
  adversaire: string
  date: Date
  lieu: string | null
  domicile: boolean
  logoAdversaire: string | null
}

interface Equipe {
  id: number
  nom: string
  categorie: string
  description: string
  entraineur: string
  matches: string | null
  photo: string
  slug: string
  entrainements: Entrainement[]
  classement: Classement[]
  matchs: Match[]
}

interface TeamCardDetailedProps {
  equipe: Equipe
}

/** Carte d'équipe de la page « Nos équipes » : photo, encadrement, créneaux et prochain match */
export function TeamCardDetailed({ equipe }: TeamCardDetailedProps) {
  const ourTeam = equipe.classement.find((team) => isClubRow(team.club))
  const nextMatch = equipe.matchs[0]

  return (
    <article
      id={`equipe-${equipe.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition-colors duration-200 hover:border-primary-500/60 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary-500"
    >
      {/* Photo grand format */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-800">
        <Image
          src={normalizeImagePath(equipe.photo, '/img/equipes/default.jpg')}
          alt=""
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/10 to-transparent" />

        <span className="absolute left-4 top-4 rounded-sm bg-primary-500 px-2 py-1 font-eyebrow text-[0.65rem] text-neutral-950">
          {getCategoryLabel(equipe.categorie)}
        </span>

        {ourTeam && (
          <div className="absolute right-4 top-4 rounded-md border border-white/10 bg-neutral-950/80 px-3 py-1.5 text-center backdrop-blur">
            <p className="font-headline text-2xl text-primary-400">
              {ourTeam.position}
              <sup className="ml-0.5 text-xs normal-case">{rankSuffix(ourTeam.position)}</sup>
            </p>
            <p className="font-eyebrow text-[0.55rem] text-neutral-400">Classement</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-xl font-bold leading-tight text-white transition-colors group-hover:text-primary-300">
          {/* Lien étiré : toute la carte mène à la fiche équipe */}
          <Link
            href={`/equipes/${equipe.slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none"
          >
            {equipe.nom}
          </Link>
        </h3>

        {equipe.entraineur && (
          <p className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
            <User className="size-4 shrink-0 text-primary-500" aria-hidden />
            <span>
              Entraîneur <span className="font-medium text-neutral-200">{equipe.entraineur}</span>
            </span>
          </p>
        )}

        {/* Créneaux d'entraînement */}
        {equipe.entrainements.length > 0 && (
          <div className="mt-5 border-t border-white/10 pt-4">
            <h4 className="mb-2.5 font-eyebrow text-[0.65rem] text-neutral-500">Entraînements</h4>
            <ul className="space-y-1.5 text-sm">
              {equipe.entrainements.map((entrainement) => (
                <li key={entrainement.id} className="flex items-center gap-2.5">
                  <Clock className="size-3.5 shrink-0 text-primary-500" aria-hidden />
                  <span className="w-20 shrink-0 font-semibold text-white">{entrainement.jour}</span>
                  <span className="text-neutral-400">{entrainement.horaire}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prochain match */}
        {nextMatch && (
          <div className="mt-5 rounded-lg border border-white/10 bg-neutral-950/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="font-eyebrow text-[0.65rem] text-neutral-500">Prochain match</h4>
              <span
                className={cn(
                  'rounded-sm px-1.5 py-0.5 font-eyebrow text-[0.6rem]',
                  nextMatch.domicile ? 'bg-primary-500/15 text-primary-300' : 'bg-white/10 text-neutral-300'
                )}
              >
                {nextMatch.domicile ? 'Domicile' : 'Extérieur'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <TeamCrest name={nextMatch.adversaire} logo={nextMatch.logoAdversaire} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{nextMatch.adversaire}</p>
                <p className="text-xs capitalize text-neutral-400">{formatMatchDay(nextMatch.date)}</p>
              </div>
              <p className="shrink-0 font-headline text-xl text-primary-400">{formatMatchTime(nextMatch.date)}</p>
            </div>
          </div>
        )}

        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-primary-400 transition-colors group-hover:text-primary-300">
          Voir l&apos;équipe
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </article>
  )
}
