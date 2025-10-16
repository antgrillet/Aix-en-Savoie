import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Calendar, MapPin, Clock, Users } from 'lucide-react'
import { normalizeImagePath } from '@/lib/utils'

export const revalidate = 1800

interface EquipePageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EquipePage({ params }: EquipePageProps) {
  const { slug } = await params

  const equipe = await prisma.equipe.findUnique({
    where: { slug },
    include: { entrainements: true },
  })

  if (!equipe) {
    notFound()
  }

  return (
    <div className="pt-24 min-h-screen bg-neutral-50">
      {/* Back Button */}
      <div className="container-padding py-6">
        <Link
          href="/equipes"
          className="inline-flex items-center text-neutral-600 hover:text-primary-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux équipes
        </Link>
      </div>

      {/* Team Header */}
      <div className="container-padding pb-20">
        <div className="max-w-4xl mx-auto">
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
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="inline-block px-4 py-2 bg-primary-500 text-white rounded-full font-semibold">
              {equipe.categorie}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">
            {equipe.nom}
          </h1>

          {/* Description */}
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: equipe.description }}
          />

          {/* Training Schedule */}
          {equipe.entrainements.length > 0 && (
            <div className="bg-white rounded-lg p-8 shadow-md">
              <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary-500" />
                Horaires d'entraînement
              </h2>
              <div className="space-y-4">
                {equipe.entrainements.map((entrainement, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="w-5 h-5 text-primary-500" />
                      <span className="font-semibold">{entrainement.jour}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Clock className="w-5 h-5 text-primary-500" />
                      <span>{entrainement.horaire}</span>
                    </div>
                    {entrainement.lieu && (
                      <div className="flex items-center gap-2 flex-1">
                        <MapPin className="w-5 h-5 text-primary-500" />
                        <span>{entrainement.lieu}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white">
            <Users className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-display font-bold mb-4">
              Rejoignez-nous !
            </h3>
            <p className="mb-6 opacity-90">
              Intéressé par cette équipe ? Contactez-nous pour plus d'informations
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-neutral-100 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
