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
            Les informations ci-dessous sont fournies conformément aux obligations légales. Merci de compléter les champs entre crochets si nécessaire.
          </p>

          <div className="space-y-10 text-neutral-300">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Éditeur du site</h2>
              <p>
                [Nom de l’association / structure] — HBC Aix-en-Savoie
                <br />
                [Adresse complète]
                <br />
                [SIRET / RNA] : [à compléter]
                <br />
                Directeur de la publication : [Nom, Prénom]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Contact</h2>
              <p>
                Email : contact@hbcaixensavoie.fr
                <br />
                Téléphone : 04 79 88 45 50
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Hébergement</h2>
              <p>
                [Nom de l’hébergeur]
                <br />
                [Adresse de l’hébergeur]
                <br />
                [Téléphone de l’hébergeur]
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
