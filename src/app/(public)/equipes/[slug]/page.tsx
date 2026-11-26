import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, User } from 'lucide-react'
import { normalizeImagePath } from '@/lib/utils'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata, excerptFromHtml } from '@/lib/seo'
import { assainirHtml } from '@/lib/html'
import { filtreDateSaison, libelleSaison } from '@/lib/saisons'
import { getSaisonAffichee } from '@/lib/saison-courante'
import { calculerReperes, logosParClub } from '@/components/team-page/reperes'
import { ReperesEquipe } from '@/components/team-page/ReperesEquipe'
import { CalendrierEquipe } from '@/components/team-page/CalendrierEquipe'
import { ClassementEquipe } from '@/components/team-page/ClassementEquipe'
import { EntrainementsEquipe, RejoindreEquipe } from '@/components/team-page/EntrainementsEquipe'

export const revalidate = 1800

interface EquipePageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: EquipePageProps) {
  const { slug } = await params
  const equipe = await prisma.equipe.findUnique({
    where: { slug, published: true },
    select: {
      nom: true,
      description: true,
      photo: true,
      slug: true,
    },
  })

  if (!equipe) {
    return buildMetadata({
      title: 'Équipe introuvable',
      description: "Cette équipe est introuvable ou non publiée.",
      path: `/equipes/${slug}`,
      noindex: true,
    })
  }

  return buildMetadata({
    title: equipe.nom,
    description: excerptFromHtml(equipe.description),
    path: `/equipes/${equipe.slug}`,
    image: normalizeImagePath(equipe.photo, '/img/equipes/default.jpg'),
  })
}

export default async function EquipePage({ params }: EquipePageProps) {
  const { slug } = await params
  const saison = await getSaisonAffichee()

  const equipe = await prisma.equipe.findUnique({
    where: { slug, published: true },
    include: {
      entrainements: true,
      matchs: {
        where: {
          published: true,
          date: filtreDateSaison(saison),
        },
        orderBy: {
          date: 'asc',
        },
      },
      classement: {
        orderBy: {
          position: 'asc',
        },
      },
    },
  })

  if (!equipe) {
    notFound()
  }

  const reperes = calculerReperes(equipe.matchs, equipe.classement, new Date())
  const logos = logosParClub(equipe.matchs)
  const aClassement = equipe.classement.length > 0
  const colonnes = aClassement
    ? 'md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_0.9fr]'
    : 'md:grid-cols-[1.4fr_1fr]'

  return (
    <div className="pt-24 min-h-screen bg-zinc-900 relative">
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Équipes', url: '/equipes' },
          { name: equipe.nom, url: `/equipes/${equipe.slug}` },
        ]}
      />
      {/* Fond : bannière très assombrie si l'admin en a mis une, sinon halo orange */}
      {equipe.banniere ? (
        <div className="fixed inset-0 z-0" aria-hidden>
          <Image
            src={normalizeImagePath(equipe.banniere, '')}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-zinc-900/90" />
        </div>
      ) : (
        <div
          aria-hidden
          className="fixed inset-0 z-0 bg-zinc-900 bg-[radial-gradient(circle_at_top_right,var(--color-primary-900)_0%,transparent_55%)]"
        />
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/equipes"
          className="mb-5 inline-flex items-center text-sm text-neutral-300 transition-colors hover:text-primary-400"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Retour aux équipes
        </Link>

        {/* Bandeau photo étroit */}
        <header className="relative mb-5 flex min-h-[220px] items-end overflow-hidden rounded-2xl">
          <Image
            src={normalizeImagePath(equipe.photo, '/img/equipes/default.jpg')}
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="object-cover"
            style={{ objectPosition: 'center 28%' }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-zinc-950/5 from-25% to-zinc-950/90"
          />
          <div className="relative flex w-full flex-col gap-3 px-5 pb-5 pt-16 sm:px-8 sm:pb-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <span className="inline-block rounded-full bg-primary-500 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide text-zinc-950">
                {equipe.categorie}
              </span>
              <h1 className="mt-2 break-words font-display text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl lg:text-5xl">
                {equipe.nom}
              </h1>
            </div>
            {equipe.entraineur && (
              <p className="flex items-start gap-1.5 text-sm text-neutral-200 sm:text-base md:max-w-[50%] md:text-right">
                <User className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  Entraîneur{' '}
                  <span className="font-semibold text-primary-400">{equipe.entraineur}</span>
                </span>
              </p>
            )}
          </div>
        </header>

        {/* Description */}
        <div
          className="prose prose-invert mb-6 max-w-4xl text-base text-neutral-200 sm:text-lg [&_*]:text-neutral-200 [&_em]:text-neutral-300 [&_p]:text-neutral-200 [&_strong]:text-white"
          dangerouslySetInnerHTML={{ __html: assainirHtml(equipe.description) }}
        />

        <ReperesEquipe reperes={reperes} />

        <div className={`mt-5 grid grid-cols-1 items-start gap-5 ${colonnes}`}>
          <CalendrierEquipe matchs={equipe.matchs} libelleSaison={libelleSaison(saison)} />
          {aClassement && <ClassementEquipe lignes={equipe.classement} logos={logos} />}
          <div className={`grid gap-5 ${aClassement ? 'md:col-span-2 md:grid-cols-2 lg:col-span-1 lg:grid-cols-1' : ''}`}>
            {equipe.entrainements.length > 0 && (
              <EntrainementsEquipe entrainements={equipe.entrainements} />
            )}
            <RejoindreEquipe nom={equipe.nom} />
          </div>
        </div>
      </div>
    </div>
  )
}
