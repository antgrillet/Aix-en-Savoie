import { ContactForm } from '@/components/forms/ContactForm'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="pt-24 min-h-screen bg-neutral-50">
      {/* Header */}
      <section className="section-spacing bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="container-padding text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Une question ? N'hésitez pas à nous contacter
          </p>
        </div>
      </section>

      <div className="container-padding py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-display font-bold mb-8">
              Informations de contact
            </h2>

            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Adresse</h3>
                  <p className="text-neutral-600">
                    Gymnase Municipal<br />
                    73100 Aix-les-Bains
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Téléphone</h3>
                  <a
                    href="tel:+33479000000"
                    className="text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    04 79 00 00 00
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <a
                    href="mailto:contact@hbc-aix.fr"
                    className="text-neutral-600 hover:text-primary-600 transition-colors"
                  >
                    contact@hbc-aix.fr
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Horaires</h3>
                  <p className="text-neutral-600">
                    Lundi - Vendredi : 9h - 18h<br />
                    Samedi : 9h - 12h
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-display font-bold mb-8">
              Envoyez-nous un message
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
