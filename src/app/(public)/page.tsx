import { prisma } from '@/lib/prisma'
import { getHeroBackgroundImage } from '@/lib/settings'
import { HeroBento } from '@/components/home/HeroBento'
import { FeaturedNews } from '@/components/home/FeaturedNews'
import { UpcomingMatches } from '@/components/home/UpcomingMatches'
import { CTASection } from '@/components/home/CTASection'
import { NewsletterSection } from '@/components/home/NewsletterSection'
import { OrganizationSchema } from '@/components/seo/StructuredData'

export const revalidate = 300

export const metadata = {
  title: 'Accueil',
  description: 'HBC Aix-en-Savoie - Club de handball passionné. Découvrez nos équipes, nos actualités et rejoignez-nous.',
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  // Récupérer les 4 derniers articles vedettes pour le hero
  const heroArticles = await prisma.article.findMany({
    where: {
      vedette: true,
      published: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: 4,
    select: {
      id: true,
      titre: true,
      categorie: true,
      image: true,
      slug: true,
    },
  })

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

  // Récupérer l'image de fond du hero
  const heroBackgroundImage = await getHeroBackgroundImage()

  return (
    <>
      <OrganizationSchema />

      {/* Hero Bento Grid */}
      {heroArticles.length > 0 && (
        <HeroBento
          articles={heroArticles}
          backgroundImage={heroBackgroundImage}
        />
      )}

      {/* Featured News */}
      {featuredArticles.length > 0 && (
        <FeaturedNews articles={featuredArticles} />
      )}

      {/* Upcoming Matches */}
      <UpcomingMatches />

      {/* Call to Action - Rejoignez-nous */}
      <CTASection />

      {/* Section Newsletter + Club Info */}
      <NewsletterSection />
    </>
  )
}
