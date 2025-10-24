import { prisma } from '@/lib/prisma'
import { TeamsPageClient } from '@/components/teams/TeamsPageClient'
import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'

export const revalidate = 1800

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
    <div className="min-h-screen bg-zinc-900 relative overflow-hidden">
      {/* Background */}
      <PageBackground imageUrl={backgroundImage} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden z-10">
        {/* Contenu */}
        <div className="relative z-30 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display">
            Nos Équipes
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-display">
            Découvrez les équipes qui font la fierté du HBC Aix-en-Savoie
          </p>
        </div>
      </section>

      {/* Contenu principal */}
      <main className="py-12 md:py-16 lg:py-20 relative z-10">
        <TeamsPageClient equipes={equipes} />
      </main>
    </div>
  )
}
