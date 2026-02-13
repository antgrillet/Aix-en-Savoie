import { ContactForm } from '@/components/forms/ContactForm'
import { PageBackground } from '@/components/layout/PageBackground'
import { getPageBackgroundImage } from '@/lib/settings'
import { MapPin, Phone, Mail, Clock, Sparkles } from 'lucide-react'
import { BreadcrumbSchema } from '@/components/seo/StructuredData'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  title: 'Contact',
  description: "Contactez le HBC Aix-en-Savoie pour toute question, inscription ou partenariat.",
  path: '/contact',
})

export default async function ContactPage() {
  // Récupérer l'image de fond
  const backgroundImage = await getPageBackgroundImage('contact')

  return (
    <div className="min-h-screen bg-zinc-900 relative overflow-hidden">
      <BreadcrumbSchema
        items={[
          { name: 'Accueil', url: '/' },
          { name: 'Contact', url: '/contact' },
        ]}
      />
      {/* Background */}
      <PageBackground imageUrl={backgroundImage} />

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full text-primary-400 text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Restons en contact
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Une question ? N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold text-white mb-8">
                Informations de contact
              </h2>

              <div className="space-y-4">
                <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Adresse</h3>
                      <p className="text-neutral-400">
                        7 rue des Prés Riants<br />
                        73100 Aix-les-Bains<br />
                        France
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Téléphone</h3>
                      <a
                        href="tel:+33479884550"
                        className="text-neutral-400 hover:text-primary-500 transition-colors"
                      >
                        04 79 88 45 50
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Email</h3>
                      <a
                        href="mailto:contact@hbcaixensavoie.fr"
                        className="text-neutral-400 hover:text-primary-500 transition-colors"
                      >
                        contact@hbcaixensavoie.fr
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-xl p-6 hover:border-primary-500/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Horaires</h3>
                      <p className="text-neutral-400">
                        Lundi - Vendredi : 9h - 18h<br />
                        Samedi : 9h - 12h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700 rounded-xl p-8">
              <h2 className="text-3xl font-display font-bold text-white mb-8">
                Envoyez-nous un message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
