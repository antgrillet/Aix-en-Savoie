import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { TeamsPageClient } from '@/components/teams/TeamsPageClient'

export const revalidate = 1800

export default async function EquipesPage() {
  const equipes = await prisma.equipe.findMany({
    orderBy: { ordre: 'asc' },
    include: {
      entrainements: true,
    },
  })

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 z-20"></div>

        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src="/img/equipes/n2f.jpg"
            alt="Équipe de handball d'Aix-en-Savoie"
            fill
            className="object-cover filter brightness-75"
            priority
          />
        </div>

        {/* Contenu */}
        <div className="relative z-30 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-display animate-fade-in-up">
            Nos Équipes
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-display mb-8 animate-fade-in-up">
            Découvrez les équipes qui font la fierté du HBC Aix-en-Savoie
          </p>
        </div>
      </section>

      {/* Contenu principal */}
      <main className="py-12 md:py-16 lg:py-20">
        <TeamsPageClient equipes={equipes} />
      </main>
    </div>
  )
}
