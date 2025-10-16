import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 pointer-events-none" />

      <div className="relative z-10 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="inline-block group">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
                <div className="relative flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group-hover:border-orange-500/50 transition-all duration-500 shadow-xl">
                  <Image
                    src="/img/home/logo.png"
                    alt="HBC Aix-en-Savoie"
                    width={80}
                    height={80}
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
            </Link>
            <div>
              <h3 className="font-display font-bold text-xl mb-3 text-white">
                HBC Aix-en-Savoie
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Club de handball passionné, engagé dans la formation et le développement des jeunes talents.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-white">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="group inline-flex items-center text-white/70 hover:text-orange-500 transition-colors text-sm"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-orange-500 transition-all duration-300 mr-0 group-hover:mr-2" />
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/actus"
                  className="group inline-flex items-center text-white/70 hover:text-orange-500 transition-colors text-sm"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-orange-500 transition-all duration-300 mr-0 group-hover:mr-2" />
                  Actualités
                </Link>
              </li>
              <li>
                <Link
                  href="/equipes"
                  className="group inline-flex items-center text-white/70 hover:text-orange-500 transition-colors text-sm"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-orange-500 transition-all duration-300 mr-0 group-hover:mr-2" />
                  Équipes
                </Link>
              </li>
              <li>
                <Link
                  href="/partenaires"
                  className="group inline-flex items-center text-white/70 hover:text-orange-500 transition-colors text-sm"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-orange-500 transition-all duration-300 mr-0 group-hover:mr-2" />
                  Partenaires
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="group inline-flex items-center text-white/70 hover:text-orange-500 transition-colors text-sm"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-orange-500 transition-all duration-300 mr-0 group-hover:mr-2" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-white">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <MapPin className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-white/70 text-sm leading-relaxed">
                  7 rue des Prés Riants<br />
                  73100 Aix-les-Bains<br />
                  France
                </div>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <Phone className="w-5 h-5 text-orange-500" />
                </div>
                <a
                  href="tel:+33479884550"
                  className="text-white/70 hover:text-orange-500 transition-colors text-sm"
                >
                  04 79 88 45 50
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <Mail className="w-5 h-5 text-orange-500" />
                </div>
                <a
                  href="mailto:contact@hbcaixensavoie.fr"
                  className="text-white/70 hover:text-orange-500 transition-colors text-sm break-all"
                >
                  contact@hbcaixensavoie.fr
                </a>
              </li>
            </ul>
          </div>

          {/* Réseaux Sociaux */}
          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-white">
              Suivez-nous
            </h4>
            <p className="text-white/60 text-sm mb-6">
              Restez connectés avec notre club sur les réseaux sociaux.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/hbcaix"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://instagram.com/hbcaix"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-12 h-12 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/50 text-sm">
              &copy; {currentYear} HBC Aix-en-Savoie. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-white/50">
              <Link href="/contact" className="hover:text-orange-500 transition-colors">
                Mentions légales
              </Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-orange-500 transition-colors">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
