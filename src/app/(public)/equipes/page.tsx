import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TeamsPageClient } from '@/components/teams/TeamsPageClient'
import { TeamsGrid } from '@/components/teams/TeamsGrid'
import { PageHero } from '@/components/site/PageHero'
import { container } from '@/components/site/styles'
import { JoinClubCTA } from '@/components/home/JoinClubCTA'
import { getPageBackgroundImage } from '@/lib/settings'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 1800

export const metadata = buildMetadata({
  title: 'Nos Équipes',
  description: 'Découvrez toutes les équipes du HBC Aix-en-Savoie, leurs entraînements et leurs matchs à venir.',
  path: '/equipes',
})

export default async function EquipesPage() {
  const equipes = await prisma.equipe.findMany({
    orderBy: { ordre: 'asc' },
    include: {
      entrainements: true,
      classement: {
        orderBy: {
          position: 'asc',
        },
      },
      matchs: {
        where: {
          published: true,
          termine: false,
          date: {
            gte: new Date(),
          },
        },
        orderBy: {
          date: 'asc',
        },
        take: 1,
      },
    },
  })

  // Récupérer l'image de fond
  const backgroundImage = await getPageBackgroundImage('equipes')

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Équipes', url: '/equipes' },
        ]}
      />

      <PageHero
        eyebrow="Du Baby Hand aux seniors"
        title="Nos équipes"
        description="Entraînements, prochains matchs, classements&nbsp;: retrouvez toutes les équipes qui portent les couleurs du HBC Aix-en-Savoie."
        backgroundImage={backgroundImage}
      />

      <section className="py-16 md:py-24">
        <div className={container}>
          {/* Sans JavaScript (ou avant hydratation), toutes les équipes restent visibles */}
          <Suspense fallback={<TeamsGrid equipes={equipes} />}>
            <TeamsPageClient equipes={equipes} />
          </Suspense>
        </div>
      </section>

      <JoinClubCTA
        title="Rejoignez nos équipes&nbsp;!"
        description="Envie de pratiquer le handball dans une ambiance conviviale&nbsp;? Des équipes pour tous les âges, des entraîneurs qualifiés et un club familial&nbsp;: nous accueillons de nouveaux joueurs tout au long de l'année, quel que soit votre niveau."
        secondary={{ href: '/contact', label: 'Nous contacter' }}
      />
    </>
  )
}
