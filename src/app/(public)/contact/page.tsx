import { Suspense } from 'react'
import Image from 'next/image'
import type { LucideIcon } from 'lucide-react'
import { MapPin, Mail, Clock, Navigation, ArrowRight } from 'lucide-react'
import { ContactForm } from '@/components/forms/ContactForm'
import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'
import { ADRESSE_CLUB, getLieuDomicile, lienItineraire } from '@/lib/lieu-domicile'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Contact',
  description: "Contactez le HBC Aix-en-Savoie pour toute question, inscription ou partenariat.",
  path: '/contact',
})

/** Photo d'équipe déjà livrée avec le site, utilisée si aucune image n'est réglée pour la page. */
const PHOTO_PAR_DEFAUT = '/img/home/photo_equipe_fem.jpg'

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-5 backdrop-blur-sm sm:p-6">
      <span
        aria-hidden="true"
        className="grid h-11 w-11 place-items-center rounded-full bg-primary-500/20 text-primary-400"
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h3 className="mb-1 font-display text-lg font-extrabold text-white">{title}</h3>
        <div className="break-words text-neutral-300">{children}</div>
      </div>
    </div>
  )
}

export default async function ContactPage() {
  const [photo, lieuDomicile] = await Promise.all([
    getPageBackgroundImage('contact'),
    getLieuDomicile(),
  ])

  const destination = lieuDomicile ?? ADRESSE_CLUB

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-900">
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Contact', url: '/contact' },
        ]}
      />
      {/* Fond sobre aux couleurs du club : l'image réglée pour la page sert de photo */}
      <PageBackground imageUrl={null} />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-36">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Photo plein hauteur avec le titre de la page */}
          <div className="relative flex min-h-[340px] items-end overflow-hidden rounded-2xl bg-zinc-800 sm:min-h-[420px] lg:min-h-[600px]">
            <Image
              src={photo || PHOTO_PAR_DEFAUT}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 540px, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-zinc-950/5 from-25% to-zinc-950/90"
            />
            <div className="relative z-10 p-6 sm:p-8">
              <h1 className="mb-3 font-display text-4xl font-black leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
                Contactez-nous
              </h1>
              <p className="max-w-xl text-base text-neutral-200 sm:text-lg">
                Inscription d&apos;un enfant, envie de jouer, question ou partenariat : dites-nous
                simplement ce qui vous amène, nous vous répondons rapidement.
              </p>
            </div>
          </div>

          {/* Formulaire, sans carte */}
          <div>
            <h2 className="mb-5 font-display text-2xl font-extrabold text-white sm:text-3xl">
              Envoyez-nous un message
            </h2>
            <Suspense fallback={null}>
              <ContactForm />
            </Suspense>
          </div>
        </div>

        {/* Bande d'accès */}
        <section aria-labelledby="infos-pratiques" className="mt-10 lg:mt-9">
          <h2 id="infos-pratiques" className="sr-only">
            Informations pratiques
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard icon={MapPin} title="Adresse">
              <p>
                7 rue des Prés Riants
                <br />
                73100 Aix-les-Bains
                <br />
                France
              </p>
            </InfoCard>

            <InfoCard icon={Mail} title="Email">
              <a
                href="mailto:contact@hbcaixensavoie.fr"
                className="rounded-sm transition-colors hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                contact@hbcaixensavoie.fr
              </a>
            </InfoCard>

            <InfoCard icon={Clock} title="Horaires">
              <p>
                Lundi – vendredi : 9h – 18h
                <br />
                Samedi : 9h – 12h
              </p>
            </InfoCard>

            <InfoCard icon={Navigation} title="Où jouons-nous ?">
              <p>{lieuDomicile ?? 'Le lieu de chaque rencontre est indiqué au calendrier.'}</p>
              <a
                href={lienItineraire(destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 rounded-sm text-sm font-bold text-primary-400 transition-colors hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Itinéraire
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">(ouvre Google Maps dans un nouvel onglet)</span>
              </a>
            </InfoCard>
          </div>
        </section>
      </div>
    </div>
  )
}
