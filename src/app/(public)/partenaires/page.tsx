import { prisma } from '@/lib/prisma'
import { PartnersPageClient } from '@/components/partners/PartnersPageClient'
import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'
import { Handshake, Heart } from 'lucide-react'
import Link from 'next/link'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 1800

export const metadata = buildMetadata({
  title: 'Nos Partenaires',
  description: 'Découvrez tous nos partenaires qui soutiennent le HBC Aix-en-Savoie. Ensemble, nous bâtissons l\'avenir du handball local.',
  path: '/partenaires',
})

export default async function PartenairesPage() {
  const partenaires = await prisma.partenaire.findMany({
    where: { published: true },
    orderBy: [
      { partenaire_majeur: 'desc' },
      { ordre: 'asc' },
      { nom: 'asc' },
    ],
  })

  // Récupérer l'image de fond
  const backgroundImage = await getPageBackgroundImage('partenaires')

  // Extraire les catégories uniques
  const categories = Array.from(new Set(partenaires.map(p => p.categorie))).sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Partenaires', url: '/partenaires' },
        ]}
      />
      {/* Background */}
      <PageBackground imageUrl={backgroundImage} />

      {/* Gradient overlay pour ajouter de la couleur */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 20% 20%, #FF6B3515 0%, transparent 50%), radial-gradient(circle at 80% 80%, #FF6B3515 0%, transparent 50%)'
        }}
      />

      {/* Hero Section - Réduit */}
      <section className="relative pt-24 pb-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-3 mb-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full text-primary-400 text-xs font-semibold">
              <Handshake className="w-3.5 h-3.5" />
              Ensemble plus forts
            </div>

            {/* Titre */}
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Nos{' '}
              <span className="bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-500 text-transparent bg-clip-text">
                Partenaires
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="text-base md:text-lg text-neutral-300 max-w-2xl mx-auto">
              Ils croient en notre projet et nous accompagnent au quotidien
            </p>
          </div>
        </div>
      </section>

      {/* Liste des partenaires */}
      <section className="py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PartnersPageClient partenaires={partenaires} categories={categories} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500" />

            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-pattern" />

            {/* Content */}
            <div className="relative z-10 p-8 md:p-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                <Handshake className="w-6 h-6 text-white" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Devenez Partenaire
              </h2>

              <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                Rejoignez nos partenaires et contribuez au développement du handball local.
                Ensemble, faisons grandir notre passion !
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-bold hover:bg-neutral-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Contactez-nous
                  <Heart className="w-4 h-4" />
                </Link>
                <Link
                  href="/equipes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-bold hover:bg-white/20 transition-all"
                >
                  Découvrir nos équipes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
