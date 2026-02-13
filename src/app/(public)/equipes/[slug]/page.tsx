import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Calendar, MapPin, Clock, Trophy } from 'lucide-react'
import { normalizeImagePath } from '@/lib/utils'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata, excerptFromHtml } from '@/lib/seo'

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

  const equipe = await prisma.equipe.findUnique({
    where: { slug },
    include: {
      entrainements: true,
      matchs: {
        where: {
          published: true,
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

  // Séparer les matchs à venir et les matchs passés
  const now = new Date()
  const upcomingMatches = equipe.matchs.filter(
    (match) => match.date >= now && !match.termine
  )
  const allMatches = equipe.matchs

  return (
    <div className="pt-24 min-h-screen bg-zinc-900 relative">
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Équipes', url: '/equipes' },
          { name: equipe.nom, url: `/equipes/${equipe.slug}` },
        ]}
      />
      {/* Background Image avec overlay */}
      {equipe.banniere && (
        <div className="fixed inset-0 z-0">
          <Image
            src={normalizeImagePath(equipe.banniere, '')}
            alt={`Background ${equipe.nom}`}
            fill
            className="object-cover"
          />
          {/* Overlay gradient équilibré */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/80 via-zinc-900/55 to-zinc-900/80" />
        </div>
      )}

      {/* Animated Background Elements si pas de bannière */}
      {!equipe.banniere && (
        <div className="fixed inset-0 z-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary-500/10 rounded-full filter blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full filter blur-3xl" />
        </div>
      )}

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/equipes"
            className="inline-flex items-center text-neutral-300 hover:text-primary-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux équipes
          </Link>
        </div>

        {/* Team Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
          {/* Featured Image */}
          <div className="relative h-96 rounded-2xl overflow-hidden mb-8">
            <Image
              src={normalizeImagePath(equipe.photo, '/img/equipes/default.jpg')}
              alt={equipe.nom}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Meta */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-primary-500 text-white rounded-full font-semibold">
              {equipe.categorie}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-white">
            {equipe.nom}
          </h1>

          {/* Description */}
          <div
            className="prose prose-lg prose-invert max-w-none mb-12 [&_*]:text-neutral-200 [&_p]:text-neutral-200 [&_strong]:text-white [&_em]:text-neutral-300 text-neutral-200"
            dangerouslySetInnerHTML={{ __html: equipe.description }}
          />

          {/* Training Schedule & Upcoming Matches - 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Training Schedule */}
            {equipe.entrainements.length > 0 && (
              <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
                <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  Horaires d'entraînement
                </h2>
                <div className="space-y-3">
                  {equipe.entrainements.map((entrainement, index) => (
                    <div
                      key={index}
                      className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        <span className="font-semibold text-white">{entrainement.jour}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-300">
                        <Clock className="w-4 h-4" />
                        <span>{entrainement.horaire}</span>
                      </div>
                      {entrainement.lieu && (
                        <div className="flex items-center gap-2 text-sm text-neutral-300 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{entrainement.lieu}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
              <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
                <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5 text-primary-500" />
                  Prochains matchs
                </h2>
                <div className="space-y-3">
                  {upcomingMatches.slice(0, 5).map((match) => (
                    <div
                      key={match.id}
                      className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-700/50 hover:border-primary-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {match.logoAdversaire && (
                          <div className="w-8 h-8 relative flex-shrink-0">
                            <Image
                              src={match.logoAdversaire}
                              alt={match.adversaire}
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className="font-semibold text-white">{match.adversaire}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-300">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(match.date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span
                          className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                            match.domicile
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {match.domicile ? 'Domicile' : 'Extérieur'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calendrier complet & Classement - 2 colonnes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Full Calendar */}
            {allMatches.length > 0 && (
              <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
                <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-primary-500" />
                  Calendrier complet
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left py-2 px-2 font-semibold text-neutral-300 text-sm">
                          Date
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-neutral-300 text-sm">
                          Adversaire
                        </th>
                        <th className="text-center py-2 px-2 font-semibold text-neutral-300 text-sm">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMatches.map((match, index) => (
                        <tr
                          key={match.id}
                          className={`border-b border-zinc-700/50 hover:bg-zinc-900/50 transition-colors ${
                            index % 2 === 0 ? 'bg-transparent' : 'bg-zinc-900/30'
                          }`}
                        >
                          <td className="py-2 px-2 text-xs text-neutral-300">
                            {new Date(match.date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-semibold ${
                              match.domicile
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {match.domicile ? 'Dom.' : 'Ext.'}
                            </span>
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              {match.logoAdversaire && (
                                <div className="w-6 h-6 relative flex-shrink-0">
                                  <Image
                                    src={match.logoAdversaire}
                                    alt={match.adversaire}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                              )}
                              <span className="text-sm text-white">{match.adversaire}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            {match.termine &&
                            match.scoreEquipe !== null &&
                            match.scoreAdversaire !== null ? (
                              <span
                                className={`font-bold text-sm ${
                                  match.scoreEquipe > match.scoreAdversaire
                                    ? 'text-green-500'
                                    : match.scoreEquipe < match.scoreAdversaire
                                    ? 'text-red-500'
                                    : 'text-yellow-500'
                                }`}
                              >
                                {match.scoreEquipe} - {match.scoreAdversaire}
                              </span>
                            ) : (
                              <span className="text-neutral-400 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Classement */}
            {equipe.classement.length > 0 && (
              <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-xl p-6">
                <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5 text-primary-500" />
                  Classement de la poule
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-zinc-700">
                        <th className="text-center py-2 px-2 font-semibold text-neutral-300 text-sm">
                          Pos
                        </th>
                        <th className="text-left py-2 px-2 font-semibold text-neutral-300 text-sm">
                          Équipe
                        </th>
                        <th className="text-center py-2 px-2 font-semibold text-neutral-300 text-sm">
                          Pts
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {equipe.classement.map((team) => {
                        const isOurTeam = team.club.toUpperCase().includes('AIX') ||
                                         team.club.toUpperCase().includes('SAVOIE')
                        return (
                          <tr
                            key={team.id}
                            className={`border-b border-zinc-700/50 transition-colors ${
                              isOurTeam
                                ? 'bg-primary-500/20 font-bold'
                                : 'hover:bg-zinc-900/50'
                            }`}
                          >
                            <td className="py-2 px-2 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
                                  isOurTeam
                                    ? 'bg-primary-500 text-white'
                                    : team.position <= 3
                                    ? 'bg-zinc-700 text-white font-semibold'
                                    : 'text-neutral-300'
                                }`}
                              >
                                {team.position}
                              </span>
                            </td>
                            <td className={`py-2 px-2 text-sm ${isOurTeam ? 'text-primary-400' : 'text-white'}`}>
                              {team.club}
                            </td>
                            <td className="py-2 px-2 text-center font-semibold text-white text-sm">
                              {team.points}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
