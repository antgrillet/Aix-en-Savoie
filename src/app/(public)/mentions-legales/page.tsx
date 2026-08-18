import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Mentions légales',
  description: 'Mentions légales du HBC Aix-en-Savoie.',
  path: '/mentions-legales',
})

export default async function MentionsLegalesPage() {
  const backgroundImage = await getPageBackgroundImage('legal')

  return (
    <div className="min-h-screen bg-zinc-900 relative overflow-hidden">
      <PageBackground imageUrl={backgroundImage} />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Mentions légales', url: '/mentions-legales' },
        ]}
      />

      <div className="relative z-10 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Mentions légales
          </h1>
          <p className="text-neutral-300 mb-10">
            Les informations ci-dessous sont fournies conformément aux obligations légales
            applicables aux sites internet édités par une association.
          </p>

          <div className="space-y-10 text-neutral-300">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Éditeur du site</h2>
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
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Contact</h2>
              <p>
                Email :{' '}
                <a
                  href="mailto:contact@hbcaixensavoie.fr"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  contact@hbcaixensavoie.fr
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Hébergement</h2>
              <p>
                Vercel Inc.
                <br />
                440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
                <br />
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 transition-colors"
                >
                  vercel.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Propriété intellectuelle</h2>
              <p>
                L’ensemble du contenu du site (textes, images, logos, vidéos) est la propriété du HBC Aix-en-Savoie
                ou de ses partenaires et ne peut être utilisé sans autorisation préalable.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
