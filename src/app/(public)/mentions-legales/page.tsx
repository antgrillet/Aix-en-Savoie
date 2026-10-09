import { PageHero } from '@/components/site/PageHero'
import { container } from '@/components/site/styles'
import { getPageBackgroundImage } from '@/lib/settings'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

export const metadata = buildMetadata({
  title: 'Mentions légales',
  description: 'Mentions légales du HBC Aix-en-Savoie.',
  path: '/mentions-legales',
})

const linkClass =
  'rounded-sm font-medium text-primary-400 underline decoration-primary-400/40 underline-offset-4 transition-colors hover:text-primary-300 hover:decoration-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'

const sections = [
  {
    id: 'editeur',
    title: 'Éditeur du site',
    content: (
      <p>
        Handball Club Aix-en-Savoie (HBC Aix-en-Savoie)
        <br />
        Association sportive régie par la loi du 1er juillet 1901
        <br />
        7 rue des Prés Riants, 73100 Aix-les-Bains, France
        <br />
        Directeur de la publication : le président de l’association
        <br />
        Numéro RNA / SIRET : communiqué sur simple demande par email
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <p>
        Email :{' '}
        <a href="mailto:contact@hbcaixensavoie.fr" className={linkClass}>
          contact@hbcaixensavoie.fr
        </a>
      </p>
    ),
  },
  {
    id: 'hebergement',
    title: 'Hébergement',
    content: (
      <p>
        Vercel Inc.
        <br />
        440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
        <br />
        <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
          vercel.com
        </a>
      </p>
    ),
  },
  {
    id: 'propriete-intellectuelle',
    title: 'Propriété intellectuelle',
    content: (
      <p>
        L’ensemble du contenu du site (textes, images, logos, vidéos) est la propriété du HBC Aix-en-Savoie
        ou de ses partenaires et ne peut être utilisé sans autorisation préalable.
      </p>
    ),
  },
]

export default async function MentionsLegalesPage() {
  const backgroundImage = await getPageBackgroundImage('legal')

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Mentions légales', url: '/mentions-legales' },
        ]}
      />

      <PageHero
        eyebrow="Informations légales"
        title="Mentions légales"
        description="Les informations ci-dessous sont fournies conformément aux obligations légales applicables aux sites internet édités par une association."
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
