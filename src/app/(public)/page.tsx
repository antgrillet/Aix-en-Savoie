import { prisma } from '@/lib/prisma'
import { getHeroBackgroundImage } from '@/lib/settings'
import { normalizeImagePath } from '@/lib/utils'
import { buildMetadata } from '@/lib/seo'
import {
  bornesWeekend,
  formatDateLongue,
  formatHeure,
  formatJourCourt,
  formatJourMois,
} from '@/lib/dates'
import { HeroWelcome } from '@/components/home/HeroWelcome'
import { HomeStats } from '@/components/home/HomeStats'
import { UpcomingMatches } from '@/components/home/UpcomingMatches'
import { FeaturedNews } from '@/components/home/FeaturedNews'
import { FeaturedPartners } from '@/components/home/FeaturedPartners'
import { JoinClubCTA } from '@/components/home/JoinClubCTA'
import { OrganizationSchema } from '@/components/seo/StructuredData'

export const revalidate = 300

export const metadata = buildMetadata({
  title: 'Accueil',
  description:
    'HBC Aix-en-Savoie - Club de handball passionné. Découvrez nos équipes, nos actualités et rejoignez-nous.',
  path: '/',
})

export default async function HomePage() {
  const now = new Date()

  const [heroBackgroundImage, featuredArticles] = await Promise.all([
    getHeroBackgroundImage(),
    prisma.article.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      take: 6,
      select: {
        id: true,
        titre: true,
        categorie: true,
        date: true,
        image: true,
        resume: true,
        slug: true,
      },
    }),
  ])

  // Équipes mises en avant : source du ticker (prochains matchs + derniers résultats)
  const featuredEquipes = await prisma.equipe.findMany({
    where: { published: true, featured: true },
    select: { id: true, nom: true, categorie: true },
    orderBy: { ordre: 'asc' },
  })
  const featuredEquipeIds = featuredEquipes.map((e) => e.id)

  const matchSelect = {
    id: true,
    adversaire: true,
    date: true,
    domicile: true,
    scoreEquipe: true,
    scoreAdversaire: true,
    equipe: { select: { nom: true, categorie: true } },
  } as const

  const [upcomingAll, lastResultsAll] = await Promise.all([
    prisma.match.findMany({
      where: {
        equipeId: { in: featuredEquipeIds },
        published: true,
        termine: false,
        date: { gte: now },
      },
      orderBy: { date: 'asc' },
      take: 4,
      select: matchSelect,
    }),
    prisma.match.findMany({
      where: {
        equipeId: { in: featuredEquipeIds },
        published: true,
        termine: true,
        scoreEquipe: { not: null },
        scoreAdversaire: { not: null },
      },
      orderBy: { date: 'desc' },
      take: 4,
      select: matchSelect,
    }),
  ])

  // Ticker façon chaîne sport : à la verticale du hero, l'info live sans encombrer
  const tickerItems = [
    ...upcomingAll.map(
      (m) =>
        `PROCHAIN MATCH · ${m.equipe.categorie.toUpperCase()} ${
          m.domicile ? 'REÇOIT' : 'SE DÉPLACE CHEZ'
        } ${m.adversaire.toUpperCase()} · ${formatJourCourt(m.date)} ${formatHeure(m.date)}`
    ),
    ...lastResultsAll.map((m) => {
      if (m.scoreEquipe === null || m.scoreAdversaire === null) return null
      const outcome =
        m.scoreEquipe > m.scoreAdversaire
          ? 'VICTOIRE'
          : m.scoreEquipe < m.scoreAdversaire
            ? 'DÉFAITE'
            : 'MATCH NUL'
      return `RÉSULTAT · ${m.equipe.nom.toUpperCase()} ${m.scoreEquipe}–${m.scoreAdversaire} ${m.adversaire.toUpperCase()} · ${outcome}`
    }),
  ].filter((item): item is string => item !== null)

  // Carte « prochain match » du hero : premier match à venir parmi les équipes en avant
  const nextMatchRaw = upcomingAll[0]
  const heroNextMatch = nextMatchRaw
    ? {
        categorie: nextMatchRaw.equipe.categorie,
        adversaire: nextMatchRaw.adversaire,
        domicile: nextMatchRaw.domicile,
        isoDate: nextMatchRaw.date.toISOString(),
        dayLabel: formatJourCourt(nextMatchRaw.date),
        timeLabel: formatHeure(nextMatchRaw.date),
      }
    : null

  // Matchs à domicile du week-end (vendredi → dimanche), toutes équipes
  // Bornes calculées à l'heure de Paris ; le samedi et le dimanche, on reste sur le week-end en cours.
  const { debut: nextFriday, fin: nextSunday } = bornesWeekend(now)

  const equipesWithWeekendMatches = await prisma.equipe.findMany({
    where: { published: true },
    select: {
      id: true,
      nom: true,
      slug: true,
      categorie: true,
      matchs: {
        where: {
          published: true,
          domicile: true,
          date: { gte: nextFriday, lte: nextSunday },
        },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          adversaire: true,
          date: true,
          lieu: true,
          competition: true,
        },
      },
    },
    orderBy: { ordre: 'asc' },
  })

  // Ordre chronologique, toutes équipes confondues
  const weekendRows = equipesWithWeekendMatches
    .flatMap((equipe) => equipe.matchs.map((match) => ({ equipe, match })))
    .sort((a, b) => a.match.date.getTime() - b.match.date.getTime())
    .map(({ equipe, match }) => ({
      id: match.id,
      day: formatJourCourt(match.date),
      time: formatHeure(match.date),
      equipeNom: equipe.nom,
      categorie: equipe.categorie,
      adversaire: match.adversaire,
      lieu: match.lieu,
      competition: match.competition,
      teamSlug: equipe.slug,
    }))

  // Compteurs réels pour le bandeau de stats
  const [nbEquipes, nbArticles] = await Promise.all([
    prisma.equipe.count({ where: { published: true } }),
    prisma.article.count({ where: { published: true } }),
  ])
  const stats = [
    { value: now.getFullYear() - 1964, suffix: '', label: "Années d'histoire" },
    { value: nbEquipes, suffix: '', label: 'Équipes au club' },
    { value: weekendRows.length, suffix: '', label: 'Matchs ce week-end' },
    { value: nbArticles, suffix: '', label: 'Actus publiées' },
  ]

  // Partenaires : majeurs d'abord, sinon échantillon des partenaires publiés
  let featuredPartenaires = await prisma.partenaire.findMany({
    where: { published: true, partenaire_majeur: true },
    orderBy: { ordre: 'asc' },
    take: 12,
    select: {
      id: true,
      nom: true,
      logo: true,
      site: true,
    },
  })
  if (featuredPartenaires.length === 0) {
    featuredPartenaires = await prisma.partenaire.findMany({
      where: { published: true },
      orderBy: { ordre: 'asc' },
      take: 12,
      select: {
        id: true,
        nom: true,
        logo: true,
        site: true,
      },
    })
  }

  return (
    <>
      <OrganizationSchema />

      <HeroWelcome
        backgroundImage={heroBackgroundImage}
        tickerItems={tickerItems}
        nextMatch={heroNextMatch}
      />

      <HomeStats stats={stats} />

      {weekendRows.length > 0 && (
        <UpcomingMatches
          rows={weekendRows}
          period={`${formatJourMois(nextFriday)} → ${formatJourMois(nextSunday)}`}
        />
      )}

      {featuredArticles.length > 0 && (
        <FeaturedNews
          articles={featuredArticles.map((a) => ({
            id: a.id,
            slug: a.slug,
            titre: a.titre,
            categorie: a.categorie,
            dateLabel: formatDateLongue(a.date),
            image: normalizeImagePath(a.image, '/img/articles/default.jpg'),
            resume: a.resume,
          }))}
        />
      )}

      {featuredPartenaires.length > 0 && (
        <FeaturedPartners
          partenaires={featuredPartenaires.map((p) => ({
            id: p.id,
            nom: p.nom,
            logo: normalizeImagePath(p.logo, '/img/partenaires/default.png'),
            site: p.site,
          }))}
        />
      )}

      <JoinClubCTA />
    </>
  )
}
