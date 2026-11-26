import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import { TeamsPageClient } from '@/components/teams/TeamsPageClient'
import { TeamsGrid } from '@/components/teams/TeamsGrid'
import type { EquipeListe } from '@/components/teams/types'
import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'
import { formatDateHeure } from '@/lib/dates'

export const revalidate = 1800

export const metadata = buildMetadata({
  title: 'Nos Équipes',
  description: 'Découvrez toutes les équipes du HBC Aix-en-Savoie, leurs entraînements et leurs matchs à venir.',
  path: '/equipes',
})

/** Même repérage du club dans le classement que sur la page d'une équipe. */
const estNotreClub = (club: string) => {
  const nom = club.toUpperCase()
  return nom.includes('HBC AIX') || nom.includes('AIX EN SAVOIE')
}

/** « Mercredi » + « 20h00 - 22h00 » → « Mer 20h00–22h00 ». */
const creneauCourt = (jour: string, horaire: string) => {
  const j = jour.trim()
  const abrege = j.charAt(0).toUpperCase() + j.slice(1, 3).toLowerCase()
  return `${abrege} ${horaire.trim().replace(/\s*-\s*/g, '–')}`
}

export default async function EquipesPage() {
  const [equipes, backgroundImage] = await Promise.all([
    prisma.equipe.findMany({
      where: { published: true },
      orderBy: { ordre: 'asc' },
      select: {
        id: true,
        nom: true,
        slug: true,
        categorie: true,
        photo: true,
        entrainements: { select: { id: true, jour: true, horaire: true }, orderBy: { id: 'asc' } },
        classement: { select: { position: true, club: true } },
        matchs: {
          where: { published: true, termine: false, date: { gte: new Date() } },
          orderBy: { date: 'asc' },
          take: 1,
          select: { adversaire: true, date: true, domicile: true },
        },
      },
    }),
    getPageBackgroundImage('equipes'),
  ])

  const liste: EquipeListe[] = equipes.map((equipe) => {
    const nous = equipe.classement.find((ligne) => estNotreClub(ligne.club))
    const match = equipe.matchs[0]
    return {
      id: equipe.id,
      nom: equipe.nom,
      slug: equipe.slug,
      categorie: equipe.categorie,
      photo: equipe.photo,
      rang: nous?.position ?? null,
      creneaux: equipe.entrainements.map((e) => creneauCourt(e.jour, e.horaire)),
      prochainMatch: match
        ? { adversaire: match.adversaire, date: formatDateHeure(match.date), domicile: match.domicile }
        : null,
    }
  })

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-900">
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Équipes', url: '/equipes' },
        ]}
      />
      <PageBackground imageUrl={backgroundImage} />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 md:pt-32 lg:px-8">
        <h1 className="mb-2 font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">
          Nos Équipes
        </h1>
        <p className="mb-8 text-lg text-zinc-200">
          Découvrez les équipes qui font la fierté du HBC Aix-en-Savoie
        </p>

        {/* Avant lecture de l'URL (filtres), la liste complète est déjà rendue côté serveur. */}
        <Suspense fallback={<TeamsGrid equipes={liste} />}>
          <TeamsPageClient equipes={liste} />
        </Suspense>
      </div>
    </div>
  )
}
