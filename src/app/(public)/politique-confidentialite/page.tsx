import { PageHero } from '@/components/site/PageHero'
import { container } from '@/components/site/styles'
import { getPageBackgroundImage } from '@/lib/settings'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const metadata = buildMetadata({
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité du HBC Aix-en-Savoie.',
  path: '/politique-confidentialite',
})

const linkClass =
  'rounded-sm font-medium text-primary-400 underline decoration-primary-400/40 underline-offset-4 transition-colors hover:text-primary-300 hover:decoration-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'

const sections = [
  {
    id: 'donnees-collectees',
    title: 'Données collectées',
    content: (
      <p>
        Nous collectons les informations que vous fournissez via le formulaire de contact : nom, prénom, email
        et message.
      </p>
    ),
  },
  {
    id: 'finalites',
    title: 'Finalités',
    content: (
      <p>
        Vos données sont utilisées uniquement pour répondre à votre demande, gérer les inscriptions et
        faciliter les échanges avec le club.
      </p>
    ),
  },
  {
    id: 'base-legale',
    title: 'Base légale',
    content: (
      <p>Le traitement est fondé sur votre consentement lorsque vous soumettez le formulaire de contact.</p>
    ),
  },
  {
    id: 'duree-de-conservation',
    title: 'Durée de conservation',
    content: (
      <p>
        Les données sont conservées pendant une durée maximale de [à compléter] mois, sauf obligation légale
        contraire.
      </p>
    ),
  },
  {
    id: 'destinataires',
    title: 'Destinataires',
    content: (
      <p>
        Les données sont destinées exclusivement aux responsables du HBC Aix-en-Savoie et ne sont pas vendues
        à des tiers.
      </p>
    ),
  },
  {
    id: 'vos-droits',
    title: 'Vos droits',
    content: (
      <p>
        Conformément au RGPD, vous pouvez demander l’accès, la rectification ou la suppression de vos données
        en écrivant à{' '}
        <a href="mailto:contact@hbcaixensavoie.fr" className={linkClass}>
          contact@hbcaixensavoie.fr
        </a>
        .
      </p>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    content: (
      <p>
        Le site n’utilise pas de cookies à des fins de suivi publicitaire. Si des outils d’analyse sont ajoutés
        ultérieurement, cette page sera mise à jour.
      </p>
    ),
  },
]

export default async function PolitiqueConfidentialitePage() {
  const backgroundImage = await getPageBackgroundImage('legal')

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Politique de confidentialité', url: '/politique-confidentialite' },
        ]}
      />

      <PageHero
        eyebrow="Informations légales"
        title="Politique de confidentialité"
        description="Cette politique explique comment le HBC Aix-en-Savoie collecte et utilise vos données personnelles."
        backgroundImage={backgroundImage}
      />

      <section className="py-16 md:py-24">
        <div className={cn(container, 'grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16')}>
          {/* Sommaire */}
          <nav aria-label="Sur cette page" className="hidden lg:block">
            <div className="sticky top-28">
              <p className="font-eyebrow text-xs text-neutral-500">Sur cette page</p>
              <ol className="mt-4 space-y-1 border-l border-white/10">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-neutral-400 transition-colors hover:border-primary-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="max-w-[68ch] space-y-12 text-base leading-relaxed text-neutral-300 md:text-[1.0625rem]">
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className="scroll-mt-28">
                <p aria-hidden className="font-eyebrow text-xs text-primary-400">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">{section.title}</h2>
                <div className="mt-4">{section.content}</div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
