import { prisma } from '@/lib/prisma'
import { getHeroBackgroundImage } from '@/lib/settings'
import { HeroWelcome } from '@/components/home/HeroWelcome'
import { FeaturedNews } from '@/components/home/FeaturedNews'
import { FeaturedMatches } from '@/components/home/FeaturedMatches'
import { UpcomingMatches } from '@/components/home/UpcomingMatches'
import { FeaturedPartners } from '@/components/home/FeaturedPartners'
import { OrganizationSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 300

export const metadata = buildMetadata({
  title: 'Accueil',
  description: 'HBC Aix-en-Savoie - Club de handball passionné. Découvrez nos équipes, nos actualités et rejoignez-nous.',
  path: '/',
})

export default async function HomePage() {
  // Récupérer les 6 derniers articles pour la section "À la Une"
  const featuredArticles = await prisma.article.findMany({
    where: {
      published: true,
    },
    orderBy: {
      date: 'desc',
    },
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
  })

  // Calculer le début et la fin du week-end prochain
  const now = new Date()
  const currentDay = now.getDay() // 0 = Dimanche, 6 = Samedi
  const daysUntilFriday = currentDay <= 5 ? 5 - currentDay : 7 - currentDay + 5
  const nextFriday = new Date(now)
  nextFriday.setDate(now.getDate() + daysUntilFriday)
  nextFriday.setHours(0, 0, 0, 0)

  const nextSunday = new Date(nextFriday)
  nextSunday.setDate(nextFriday.getDate() + 2)
  nextSunday.setHours(23, 59, 59, 999)

  // Récupérer les équipes featured avec leurs matchs
  const featuredEquipes = await prisma.equipe.findMany({
    where: {
      published: true,
      featured: true,
    },
    select: {
      id: true,
      nom: true,
      categorie: true,
      ordre: true,
    },
    orderBy: {
      ordre: 'asc',
    },
  })

  const featuredEquipeIds = featuredEquipes.map((e) => e.id)

  // Récupérer les prochains matchs et les derniers résultats en une seule requête
  const [upcomingMatchesAll, lastResultsAll] = await Promise.all([
    prisma.match.findMany({
      where: {
        equipeId: { in: featuredEquipeIds },
        published: true,
        termine: false,
        date: {
          gte: now,
        },
      },
      orderBy: {
        date: 'asc',
      },
      select: {
        id: true,
        adversaire: true,
        date: true,
        lieu: true,
        domicile: true,
        competition: true,
        scoreEquipe: true,
        scoreAdversaire: true,
        termine: true,
        logoAdversaire: true,
        equipeId: true,
        equipe: {
          select: {
            nom: true,
            categorie: true,
          },
        },
      },
    }),
    prisma.match.findMany({
      where: {
        equipeId: { in: featuredEquipeIds },
        published: true,
        termine: true,
        scoreEquipe: { not: null },
        scoreAdversaire: { not: null },
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        id: true,
        adversaire: true,
        date: true,
        lieu: true,
        domicile: true,
        competition: true,
        scoreEquipe: true,
        scoreAdversaire: true,
        termine: true,
        logoAdversaire: true,
        equipeId: true,
        equipe: {
          select: {
            nom: true,
            categorie: true,
          },
        },
      },
    }),
  ])

  const upcomingByEquipe = new Map<number, (typeof upcomingMatchesAll)[number]>()
  for (const match of upcomingMatchesAll) {
    if (!upcomingByEquipe.has(match.equipeId)) {
      upcomingByEquipe.set(match.equipeId, match)
    }
  }

  const lastResultByEquipe = new Map<number, (typeof lastResultsAll)[number]>()
  for (const match of lastResultsAll) {
    if (!lastResultByEquipe.has(match.equipeId)) {
      lastResultByEquipe.set(match.equipeId, match)
    }
  }

  const upcomingMatches = featuredEquipes
    .map((equipe) => upcomingByEquipe.get(equipe.id))
    .filter((match): match is NonNullable<typeof match> => Boolean(match))

  const lastResults = featuredEquipes
    .map((equipe) => lastResultByEquipe.get(equipe.id))
    .filter((match): match is NonNullable<typeof match> => Boolean(match))

  // Limiter les matchs à venir à 2 maximum
  const limitedUpcomingMatches = upcomingMatches.slice(0, 2)

  // Récupérer l'image de fond du hero
  const heroBackgroundImage = await getHeroBackgroundImage()

  // Récupérer toutes les équipes publiées avec leurs matchs du week-end à domicile
  const equipesWithWeekendMatches = await prisma.equipe.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      nom: true,
      categorie: true,
      genre: true,
      photo: true,
      featured: true,
      matchs: {
        where: {
          published: true,
          domicile: true, // Seulement les matchs à domicile
          date: {
            gte: nextFriday,
            lte: nextSunday,
          },
        },
        orderBy: {
          date: 'asc',
        },
        take: 1,
        select: {
          id: true,
          adversaire: true,
          date: true,
          lieu: true,
          domicile: true,
          competition: true,
          scoreEquipe: true,
          scoreAdversaire: true,
          termine: true,
          logoAdversaire: true,
        },
      },
    },
    orderBy: {
      ordre: 'asc',
    },
  })

  // Filtrer pour ne garder que les équipes qui ont au moins un match à domicile
  const teamsWithMatches = equipesWithWeekendMatches.filter(equipe => equipe.matchs.length > 0)

  // Récupérer les partenaires pour la page d'accueil
  const featuredPartenaires = await prisma.partenaire.findMany({
    where: {
      published: true,
      partenaire_majeur: true,
    },
    orderBy: {
      ordre: 'asc',
    },
    take: 12,
    select: {
      id: true,
      nom: true,
      logo: true,
      site: true,
      partenaire_majeur: true,
    },
  })

  return (
    <>
      <OrganizationSchema />

      {/* Hero Welcome - Club Presentation */}
      <HeroWelcome backgroundImage={heroBackgroundImage} partenaires={featuredPartenaires} articles={featuredArticles}>
        <FeaturedMatches upcomingMatches={limitedUpcomingMatches} lastResults={lastResults} />
      </HeroWelcome>

      {/* Featured News */}
      {featuredArticles.length > 0 && (
        <FeaturedNews articles={featuredArticles} />
      )}

      {/* Upcoming Matches */}
      <UpcomingMatches teams={teamsWithMatches} />

      {/* Featured Partners */}
      {featuredPartenaires.length > 0 && (
        <FeaturedPartners partenaires={featuredPartenaires} />
      )}
    </>
  )
}
