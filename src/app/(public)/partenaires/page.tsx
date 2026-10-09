import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PartnersPageClient } from '@/components/partners/PartnersPageClient'
import { PartnersSections } from '@/components/partners/PartnersSections'
import { JoinClubCTA } from '@/components/home/JoinClubCTA'
import { PageHero } from '@/components/site/PageHero'
import { container, siteButton } from '@/components/site/styles'
import { getPageBackgroundImage } from '@/lib/settings'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

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
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Partenaires', url: '/partenaires' },
        ]}
      />

      <PageHero
        eyebrow="Ensemble plus forts"
        title="Nos partenaires"
        description="Ils croient en notre projet et nous accompagnent au quotidien. Un grand merci pour leur soutien&nbsp;!"
        backgroundImage={backgroundImage}
      >
        <Link href="/contact?sujet=partenariat" className={cn(siteButton(), 'group')}>
          Devenir partenaire
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </Link>
      </PageHero>

      <section className="py-16 md:py-24">
        <div className={container}>
          {/* Sans JavaScript (ou avant hydratation), tous les partenaires restent visibles */}
          <Suspense fallback={<PartnersSections partenaires={partenaires} />}>
            <PartnersPageClient partenaires={partenaires} categories={categories} />
          </Suspense>
        </div>
      </section>

      <JoinClubCTA
        title="Devenez partenaire"
        description="Rejoignez nos partenaires et contribuez au développement du handball local. Visibilité, événements, valeurs partagées&nbsp;: ensemble, faisons grandir notre passion&nbsp;!"
        primary={{ href: '/contact?sujet=partenariat', label: 'Contactez-nous' }}
        secondary={{ href: '/equipes', label: 'Découvrir nos équipes' }}
      />
    </>
  )
}
