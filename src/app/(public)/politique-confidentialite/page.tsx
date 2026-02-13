import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité du HBC Aix-en-Savoie.',
  path: '/politique-confidentialite',
})

export default async function PolitiqueConfidentialitePage() {
  const backgroundImage = await getPageBackgroundImage('legal')

  return (
    <div className="min-h-screen bg-zinc-900 relative overflow-hidden">
      <PageBackground imageUrl={backgroundImage} />
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Politique de confidentialité', url: '/politique-confidentialite' },
        ]}
      />

      <div className="relative z-10 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Politique de confidentialité
          </h1>
          <p className="text-neutral-300 mb-10">
            Cette politique explique comment le HBC Aix-en-Savoie collecte et utilise vos données personnelles.
          </p>

          <div className="space-y-10 text-neutral-300">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Données collectées</h2>
              <p>
                Nous collectons les informations que vous fournissez via le formulaire de contact : nom, prénom, email,
                téléphone (optionnel) et message.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Finalités</h2>
              <p>
                Vos données sont utilisées uniquement pour répondre à votre demande, gérer les inscriptions et
                faciliter les échanges avec le club.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Base légale</h2>
              <p>
                Le traitement est fondé sur votre consentement lorsque vous soumettez le formulaire de contact.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Durée de conservation</h2>
              <p>
                Les données sont conservées pendant une durée maximale de [à compléter] mois, sauf obligation légale
                contraire.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Destinataires</h2>
              <p>
                Les données sont destinées exclusivement aux responsables du HBC Aix-en-Savoie et ne sont pas vendues
                à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Vos droits</h2>
              <p>
                Conformément au RGPD, vous pouvez demander l’accès, la rectification ou la suppression de vos données
                en écrivant à contact@hbcaixensavoie.fr.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-3">Cookies</h2>
              <p>
                Le site n’utilise pas de cookies à des fins de suivi publicitaire. Si des outils d’analyse sont ajoutés
                ultérieurement, cette page sera mise à jour.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
