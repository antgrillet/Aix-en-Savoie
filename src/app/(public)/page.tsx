import { prisma } from '@/lib/prisma'
import { getHeroBackgroundImage } from '@/lib/settings'
import { bornesWeekend, formatJourCourt } from '@/lib/dates'
import { filtreDateSaison } from '@/lib/saisons'
import { getSaisonAffichee } from '@/lib/saison-courante'
import { HeroWelcome } from '@/components/home/HeroWelcome'
import { FeaturedNews } from '@/components/home/FeaturedNews'
import { FeaturedMatches } from '@/components/home/FeaturedMatches'
import { UpcomingMatches } from '@/components/home/UpcomingMatches'
import { FeaturedPartners } from '@/components/home/FeaturedPartners'
import { ResultatsClassements, type EquipeResultats } from '@/components/home/ResultatsClassements'
import { NousTrouver } from '@/components/home/NousTrouver'
import { ADRESSE_CLUB, getLieuDomicile, lienItineraire } from '@/lib/lieu-domicile'
import { estNotreClub } from '@/components/team-page/reperes'
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

  // Week-end à venir (vendredi → dimanche), calculé à l'heure de Paris ;
  // le samedi et le dimanche, on reste sur le week-end en cours.
  const now = new Date()
  const { debut: nextFriday, fin: nextSunday } = bornesWeekend(now)
  const saison = await getSaisonAffichee()

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
      slug: true,
      ordre: true,
      classement: {
        orderBy: { position: 'asc' },
        select: { id: true, position: true, club: true, points: true },
      },
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
        // Saison affichée seulement : les résultats des saisons passées restent dans l'admin
        date: filtreDateSaison(saison),
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

  // Résultats & classements des équipes phares : 3 derniers scores de la saison
  // et haut du classement (avec la ligne du club si elle n'y figure pas)
  const resultatsEquipes: EquipeResultats[] = featuredEquipes
    .map((equipe) => {
      const resultats = lastResultsAll
        .filter((m) => m.equipeId === equipe.id && m.scoreEquipe !== null && m.scoreAdversaire !== null)
        .slice(0, 3)
        .map((m) => ({
          id: m.id,
          dateLabel: formatJourCourt(m.date),
          domicile: m.domicile,
          adversaire: m.adversaire,
          scoreEquipe: m.scoreEquipe as number,
          scoreAdversaire: m.scoreAdversaire as number,
        }))
      const lignes = equipe.classement.map((l) => ({ ...l, nous: estNotreClub(l.club) }))
      const haut = lignes.slice(0, 4)
      const notre = lignes.find((l) => l.nous)
      const classement = notre && !haut.includes(notre) ? [...haut, notre] : haut
      return {
        id: equipe.id,
        nom: equipe.nom,
        categorie: equipe.categorie,
        slug: equipe.slug,
        resultats,
        classement,
        totalEquipes: lignes.length,
      }
    })
    .filter((e) => e.resultats.length > 0 || e.classement.length > 0)
    .slice(0, 4)

  const lieuDomicile = await getLieuDomicile()

  // Partenaires : majeurs d'abord, sinon les partenaires publiés
  const partenairesQuery = (majeurs: boolean) =>
    prisma.partenaire.findMany({
      where: majeurs ? { published: true, partenaire_majeur: true } : { published: true },
      orderBy: { ordre: 'asc' },
      take: 12,
      select: { id: true, nom: true, logo: true, site: true, partenaire_majeur: true },
    })
  let featuredPartenaires = await partenairesQuery(true)
  if (featuredPartenaires.length === 0) {
    featuredPartenaires = await partenairesQuery(false)
  }

  return (
    // Les titres gardent la police d'origine de la page d'accueil (Montserrat)
    <div style={{ ['--font-display' as string]: "var(--font-montserrat), 'Inter', sans-serif" }}>
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

      {/* Résultats et classements des équipes phares */}
      <ResultatsClassements equipes={resultatsEquipes} />

      {/* Featured Partners */}
      {featuredPartenaires.length > 0 && (
        <FeaturedPartners partenaires={featuredPartenaires} />
      )}

      {/* Gymnase, secrétariat et inscription */}
      <NousTrouver lieu={lieuDomicile} itineraire={lienItineraire(lieuDomicile ?? ADRESSE_CLUB)} />
    </div>
  )
}
