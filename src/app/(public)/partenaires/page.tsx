import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { PartnersPageClient } from '@/components/partners/PartnersPageClient'
import type { PartenaireListe } from '@/components/partners/PartnerListItem'
import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'
import Link from 'next/link'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const revalidate = 1800

export const metadata = buildMetadata({
  title: 'Nos Partenaires',
  description: 'Découvrez tous nos partenaires qui soutiennent le HBC Aix-en-Savoie. Ensemble, nous bâtissons l\'avenir du handball local.',
  path: '/partenaires',
})

// Ordre des sections : institutions en tête, puis les secteurs les plus utiles aux licenciés,
// les autres catégories par ordre alphabétique et « Autres » en dernier.
const ORDRE_SECTEURS = ['Institution', 'Commerce local', 'Restauration', 'Services', 'Santé', 'Industrie']

function rangSecteur(categorie: string) {
  if (categorie === 'Autres') return Number.POSITIVE_INFINITY
  const index = ORDRE_SECTEURS.indexOf(categorie)
  return index === -1 ? ORDRE_SECTEURS.length : index
}

export default async function PartenairesPage() {
  const partenaires = await prisma.partenaire.findMany({
    where: { published: true },
    orderBy: [
      { partenaire_majeur: 'desc' },
      { ordre: 'asc' },
      { nom: 'asc' },
    ],
    select: {
      id: true,
      nom: true,
      slug: true,
      categorie: true,
      logo: true,
      description: true,
      promoActive: true,
      promoTitre: true,
      promoCode: true,
      promoExpiration: true,
    },
  })

  // Récupérer l'image de fond
  const backgroundImage = await getPageBackgroundImage('partenaires')

  // Offre licenciés : active, avec un titre et non expirée. Le code n'est transmis que s'il est renseigné.
  const maintenant = new Date()
  const liste: PartenaireListe[] = partenaires.map((p) => {
    const titre = p.promoTitre?.trim()
    const offreValide =
      p.promoActive && !!titre && (!p.promoExpiration || p.promoExpiration >= maintenant)
    const code = p.promoCode?.trim()
    return {
      id: p.id,
      nom: p.nom,
      slug: p.slug,
      categorie: p.categorie,
      logo: p.logo,
      description: p.description,
      offre: offreValide && titre ? { titre, code: code || null } : null,
    }
  })

  const categories = Array.from(new Set(liste.map((p) => p.categorie))).sort(
    (a, b) => rangSecteur(a) - rangSecteur(b) || a.localeCompare(b, 'fr')
  )

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

      {/* Halo orange en haut à droite */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'radial-gradient(800px 420px at 100% 0, rgba(238, 86, 12, 0.16), transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        {/* En-tête */}
        <header className="mb-8">
          <p className="mb-2.5 font-mono text-xs uppercase tracking-[0.2em] text-primary-400">
            Ensemble plus forts
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
            Nos Partenaires
          </h1>
          <p className="mt-2 text-base text-neutral-300 md:text-lg">
            Ils croient en notre projet et nous accompagnent au quotidien
          </p>
        </header>

        {/* Liste des partenaires */}
        <Suspense fallback={null}>
          <PartnersPageClient partenaires={liste} categories={categories} />
        </Suspense>

        {/* Devenez partenaire */}
        <section
          aria-labelledby="devenez-partenaire"
          className="mt-12 flex flex-col gap-5 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-7 sm:flex-row sm:items-center sm:justify-between md:px-8"
        >
          <div>
            <h2
              id="devenez-partenaire"
              className="font-display text-2xl font-black uppercase leading-tight text-white md:text-[28px]"
            >
              Devenez partenaire
            </h2>
            <p className="mt-1 font-medium text-white/90">
              Rejoignez nos partenaires et contribuez au développement du handball local. Ensemble,
              faisons grandir notre passion !
            </p>
          </div>
          <Link
            href="/contact?sujet=partenariat"
            className="inline-flex flex-none items-center justify-center self-start whitespace-nowrap rounded-full bg-white px-7 py-3.5 font-bold text-zinc-950 shadow-xl transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700 sm:self-auto"
          >
            Contactez-nous
          </Link>
        </section>
      </div>
    </div>
  )
}
