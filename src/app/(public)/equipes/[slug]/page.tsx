import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Clock, MapPin } from 'lucide-react'
import { cn, normalizeImagePath } from '@/lib/utils'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata, excerptFromHtml, stripHtml } from '@/lib/seo'
import { Eyebrow } from '@/components/site/Eyebrow'
import { container, siteCard } from '@/components/site/styles'
import { JoinClubCTA } from '@/components/home/JoinClubCTA'
import { TeamMatchList } from '@/components/teams/TeamMatchList'
import { StandingsTable } from '@/components/teams/StandingsTable'
import { getCategoryLabel, getGenreLabel, isClubRow, rankSuffix } from '@/components/teams/categories'
import { formatMatchDay, formatMatchTime, getMatchOutcome } from '@/lib/match-format'

export const revalidate = 1800

interface EquipePageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: EquipePageProps) {
  const { slug } = await params
  const equipe = await prisma.equipe.findUnique({
    where: { slug, published: true },
    select: {
      nom: true,
      description: true,
      photo: true,
      slug: true,
    },
  })

  if (!equipe) {
    return buildMetadata({
      title: 'Équipe introuvable',
      description: "Cette équipe est introuvable ou non publiée.",
      path: `/equipes/${slug}`,
      noindex: true,
    })
  }

  return buildMetadata({
    title: equipe.nom,
    description: excerptFromHtml(equipe.description),
    path: `/equipes/${equipe.slug}`,
    image: normalizeImagePath(equipe.photo, '/img/equipes/default.jpg'),
  })
}

// Colonnes du bandeau de chiffres clés sur grand écran (classes écrites en entier pour Tailwind)
const STAT_COLUMNS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
}

/** Titre de bloc : petit libellé orange + titre condensé */
function BlockTitle({ eyebrow, title, id }: { eyebrow?: string; title: string; id?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 id={id} className="font-headline text-3xl text-white sm:text-4xl">
        {title}
      </h2>
    </div>
  )
}

export default async function EquipePage({ params }: EquipePageProps) {
  const { slug } = await params

  const equipe = await prisma.equipe.findUnique({
    where: { slug },
    include: {
      entrainements: true,
      matchs: {
        where: {
          published: true,
        },
        orderBy: {
          date: 'asc',
        },
      },
      classement: {
        orderBy: {
          position: 'asc',
        },
      },
    },
  })

  if (!equipe) {
    notFound()
  }

  // Séparer les matchs à venir et les matchs passés
  const now = new Date()
  const upcomingMatches = equipe.matchs.filter(
    (match) => match.date >= now && !match.termine
  )
  // Le reste du calendrier, du plus récent au plus ancien
  const pastMatches = equipe.matchs
    .filter((match) => !(match.date >= now && !match.termine))
    .reverse()

  // Chiffres clés affichés dans l'en-tête
  const ourTeam = equipe.classement.find((team) => isClubRow(team.club))
  const outcomes = pastMatches
    .map((match) => getMatchOutcome(match.scoreEquipe, match.scoreAdversaire))
    .filter((outcome) => outcome !== null)
  const record = {
    win: outcomes.filter((o) => o === 'win').length,
    draw: outcomes.filter((o) => o === 'draw').length,
    loss: outcomes.filter((o) => o === 'loss').length,
  }
  const nextMatch = upcomingMatches[0]

  const stats: { label: string; value: React.ReactNode; hint?: string }[] = []
  if (ourTeam) {
    stats.push({
      label: 'Classement',
      value: (
        <>
          {ourTeam.position}
          <sup className="ml-0.5 text-[0.5em] normal-case">{rankSuffix(ourTeam.position)}</sup>
        </>
      ),
      hint: `${ourTeam.points} pts`,
    })
  }
  if (outcomes.length > 0) {
    stats.push({
      label: 'Bilan',
      value: `${record.win}V ${record.draw}N ${record.loss}D`,
      hint: `${outcomes.length} match${outcomes.length > 1 ? 's' : ''} joué${outcomes.length > 1 ? 's' : ''}`,
    })
  }
  if (nextMatch) {
    stats.push({
      label: 'Prochain match',
      value: formatMatchDay(nextMatch.date),
      hint: `${formatMatchTime(nextMatch.date)} · ${nextMatch.domicile ? 'vs' : 'à'} ${nextMatch.adversaire}`,
    })
  }
  if (equipe.entrainements.length > 0) {
    stats.push({
      label: 'Entraînements',
      value: equipe.entrainements.length,
      hint: `créneau${equipe.entrainements.length > 1 ? 'x' : ''} par semaine`,
    })
  }

  const heroImage = normalizeImagePath(equipe.banniere || equipe.photo, '/img/equipes/default.jpg')
  const hasDescription = stripHtml(equipe.description).trim().length > 0
  const genreLabel = getGenreLabel(equipe.genre)

  const infos = [
    { label: 'Catégorie', value: getCategoryLabel(equipe.categorie) },
    { label: 'Genre', value: genreLabel },
    { label: 'Entraîneur', value: equipe.entraineur },
  ].filter((info) => info.value)

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Équipes', url: '/equipes' },
          { name: equipe.nom, url: `/equipes/${equipe.slug}` },
        ]}
      />

      {/* En-tête : bannière (ou photo) de l'équipe */}
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-neutral-950">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%] opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/75 to-neutral-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-neutral-950/70" />
        </div>

        <div className={cn(container, 'flex min-h-[32rem] flex-col justify-end pb-10 pt-28 md:min-h-[38rem] md:pb-14 md:pt-36')}>
          <Link
            href="/equipes"
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-sm text-sm font-medium text-neutral-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Toutes les équipes
          </Link>

          <Eyebrow className="mb-5">{getCategoryLabel(equipe.categorie)}</Eyebrow>
          <h1 className="max-w-5xl font-headline text-5xl text-white sm:text-7xl lg:text-8xl">{equipe.nom}</h1>

          {infos.length > 0 && (
            <dl className="mt-7 flex flex-wrap gap-2">
              {infos.map((info) => (
                <div
                  key={info.label}
                  className="rounded-md border border-white/10 bg-neutral-950/60 px-3.5 py-2 backdrop-blur"
                >
                  <dt className="font-eyebrow text-[0.6rem] text-neutral-500">{info.label}</dt>
                  <dd className="text-sm font-semibold text-white">{info.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {stats.length > 0 && (
            <dl
              className={cn(
                'mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10',
                STAT_COLUMNS[stats.length]
              )}
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-0 bg-neutral-950/85 p-4 backdrop-blur last:odd:col-span-2 sm:p-5 lg:last:odd:col-span-1"
                >
                  <dt className="font-eyebrow text-[0.6rem] text-neutral-500 sm:text-[0.65rem]">{stat.label}</dt>
                  <dd className="mt-1.5 font-headline text-2xl text-white sm:text-3xl">{stat.value}</dd>
                  {stat.hint && <dd className="mt-1 truncate text-xs text-neutral-400">{stat.hint}</dd>}
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className={cn(container, 'grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem]')}>
          <div className="min-w-0 space-y-16">
            {/* Présentation */}
            {(hasDescription || equipe.banniere) && (
              <section aria-labelledby="presentation">
                <BlockTitle eyebrow="L'équipe" title="Présentation" id="presentation" />
                {hasDescription && (
                  <div
                    className="prose prose-invert max-w-none prose-p:text-neutral-300 prose-headings:text-white prose-strong:text-white prose-a:text-primary-400 md:prose-lg"
                    dangerouslySetInnerHTML={{ __html: equipe.description }}
                  />
                )}
                {/* La photo n'est pas déjà visible dans l'en-tête quand une bannière est définie */}
                {equipe.banniere && equipe.photo && (
                  <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-neutral-900">
                    <Image
                      src={normalizeImagePath(equipe.photo, '/img/equipes/default.jpg')}
                      alt={`Photo de l'équipe ${equipe.nom}`}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </section>
            )}

            {/* Calendrier et résultats */}
            <section aria-labelledby="calendrier">
              <BlockTitle eyebrow="Saison" title="Calendrier & résultats" id="calendrier" />

              {upcomingMatches.length === 0 && pastMatches.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/15 px-6 py-12 text-center text-neutral-400">
                  Le calendrier de l&apos;équipe sera publié prochainement.
                </p>
              ) : (
                <div className="space-y-10">
                  {upcomingMatches.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-eyebrow text-xs text-neutral-500">À venir</h3>
                      <TeamMatchList matches={upcomingMatches} upcoming />
                    </div>
                  )}
                  {pastMatches.length > 0 && (
                    <div>
                      <h3 className="mb-3 font-eyebrow text-xs text-neutral-500">Résultats</h3>
                      <TeamMatchList matches={pastMatches} />
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="min-w-0 space-y-12">
            {/* Entraînements */}
            {equipe.entrainements.length > 0 && (
              <section aria-labelledby="entrainements">
                <BlockTitle eyebrow="Sur le terrain" title="Entraînements" id="entrainements" />
                <ul className={cn(siteCard, 'divide-y divide-white/10')}>
                  {equipe.entrainements.map((entrainement) => (
                    <li key={entrainement.id} className="flex gap-4 p-4 sm:p-5">
                      <span
                        aria-hidden
                        className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary-500/25 bg-primary-500/10 font-headline text-sm text-primary-400"
                      >
                        {entrainement.jour.slice(0, 3)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-white">{entrainement.jour}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-300">
                          <Clock className="size-3.5 shrink-0 text-primary-500" aria-hidden />
                          {entrainement.horaire}
                        </p>
                        {entrainement.lieu && (
                          <p className="mt-0.5 flex items-start gap-1.5 text-sm text-neutral-400">
                            <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary-500" aria-hidden />
                            {entrainement.lieu}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Classement */}
            {equipe.classement.length > 0 && (
              <section aria-labelledby="classement">
                <BlockTitle eyebrow="Championnat" title="Classement" id="classement" />
                <StandingsTable classement={equipe.classement} />
              </section>
            )}
          </aside>
        </div>
      </section>

      <JoinClubCTA />
    </>
  )
}
