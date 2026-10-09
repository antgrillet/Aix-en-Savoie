import { Suspense } from 'react'
import { Clock, Mail, MapPin } from 'lucide-react'
import { Icon } from '@iconify/react/offline'
import facebookIcon from '@iconify-icons/simple-icons/facebook'
import instagramIcon from '@iconify-icons/simple-icons/instagram'
import { ContactForm } from '@/components/forms/ContactForm'
import { PageHero } from '@/components/site/PageHero'
import { Eyebrow } from '@/components/site/Eyebrow'
import { container, siteButton, siteCard } from '@/components/site/styles'
import { getPageBackgroundImage } from '@/lib/settings'
import { ADDRESS_LINES, CONTACT_EMAIL, SOCIAL_LINKS } from '@/lib/site'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const metadata = buildMetadata({
  title: 'Contact',
  description: "Contactez le HBC Aix-en-Savoie pour toute question, inscription ou partenariat.",
  path: '/contact',
})

const HORAIRES = ['Lundi - Vendredi : 9h - 18h', 'Samedi : 9h - 12h']

const SOCIALS = [
  { name: 'Facebook', href: SOCIAL_LINKS.facebook, icon: facebookIcon },
  { name: 'Instagram', href: SOCIAL_LINKS.instagram, icon: instagramIcon },
]

function InfoRow({
  icon: IconComponent,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <li className="flex gap-4 p-5 sm:p-6">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary-500/25 bg-primary-500/10 text-primary-400">
        <IconComponent className="size-5" />
      </span>
      <div className="min-w-0">
        <h3 className="font-eyebrow text-xs text-neutral-500">{title}</h3>
        <div className="mt-1.5 text-neutral-200">{children}</div>
      </div>
    </li>
  )
}

export default async function ContactPage() {
  // Image de fond configurable depuis l'admin
  const backgroundImage = await getPageBackgroundImage('contact')

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Contact', url: '/contact' },
        ]}
      />

      <PageHero
        eyebrow="Contact"
        title="Contactez-nous"
        description="Inscription d'un enfant, envie de jouer, question ou partenariat : dites-nous simplement ce qui vous amène, nous vous répondons rapidement."
        backgroundImage={backgroundImage}
      />

      <section className="py-16 md:py-24">
        <div className={cn(container, 'grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16')}>
          {/* Coordonnées */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow className="mb-4">Le club</Eyebrow>
            <h2 className="font-headline text-4xl text-white sm:text-5xl">Nos coordonnées</h2>
            <p className="mt-4 max-w-md text-neutral-400">
              Le formulaire est le moyen le plus simple de nous joindre. Vous pouvez aussi nous écrire
              directement par e-mail.
            </p>

            <ul className={cn(siteCard, 'mt-8 divide-y divide-white/10')}>
              <InfoRow icon={MapPin} title="Adresse">
                <address className="not-italic">
                  {ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </InfoRow>
              <InfoRow icon={Mail} title="E-mail">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="-my-2 inline-block break-all rounded-sm py-2 font-medium text-primary-400 transition-colors hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {CONTACT_EMAIL}
                </a>
              </InfoRow>
              <InfoRow icon={Clock} title="Horaires">
                {HORAIRES.map((ligne) => (
                  <span key={ligne} className="block">
                    {ligne}
                  </span>
                ))}
              </InfoRow>
            </ul>

            <div className="mt-8">
              <h3 className="font-eyebrow text-xs text-neutral-500">Suivez-nous</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {SOCIALS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={siteButton({ variant: 'outline', size: 'md' })}
                  >
                    <Icon icon={social.icon} />
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire : en premier sur mobile, à droite sur grand écran */}
          <div className={cn(siteCard, 'order-first p-5 sm:p-8 lg:order-none lg:p-10')}>
            <h2 className="font-headline text-3xl text-white sm:text-4xl">Envoyez-nous un message</h2>
            <p className="mt-2 text-sm text-neutral-400">Les champs marqués d&apos;un * sont obligatoires.</p>
            <div className="mt-8">
              <Suspense fallback={<div className="min-h-[36rem]" aria-hidden />}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
