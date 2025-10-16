'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeInUp, fadeInLeft, fadeInRight } from '@/lib/animations'

export function NewsletterSection() {
  return (
    <section className="py-16 bg-zinc-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInLeft}
            className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg p-8 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-primary-300 opacity-30 blur-md" />
            <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 rounded-full bg-primary-700 opacity-20 blur-md" />
            <div className="relative z-10">
              <h3 className="text-3xl text-black font-bold font-mont mb-4">
                Restez informé
              </h3>
              <p className="text-black/90 mb-6 font-mont">
                Inscrivez-vous à notre newsletter pour recevoir toutes les actualités du club.
              </p>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <label htmlFor="newsletter-email" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  placeholder="Votre adresse email"
                  required
                  aria-label="Adresse email pour la newsletter"
                  className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black shadow-inner font-mont"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-black text-white font-bold font-mont rounded-lg hover:bg-zinc-800 transition-colors shadow-lg hover:shadow-xl"
                >
                  S'abonner
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInRight}
            className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-8 border border-zinc-800 shadow-xl"
          >
            <h3 className="text-3xl text-white font-bold font-mont mb-6 relative inline-block">
              Le Club
              <span className="absolute -bottom-2 left-0 w-20 h-1 bg-gradient-to-r from-primary-500 to-transparent" />
            </h3>
            <div className="space-y-4 text-neutral-300">
              <p className="font-mont">
                Le HBC Aix-en-Savoie est un club de handball dynamique et compétitif, engagé dans la formation de jeunes talents et l'excellence sportive.
              </p>
              <nav className="flex flex-col gap-3 mt-6" aria-label="Liens rapides du club">
                <Link
                  href="/equipes"
                  className="flex items-center gap-3 text-white hover:text-primary-500 transition-colors font-mont font-semibold"
                >
                  <span className="w-2 h-2 bg-primary-500 rounded-full" aria-hidden="true" />
                  Découvrir nos équipes
                </Link>
                <Link
                  href="/partenaires"
                  className="flex items-center gap-3 text-white hover:text-primary-500 transition-colors font-mont font-semibold"
                >
                  <span className="w-2 h-2 bg-primary-500 rounded-full" aria-hidden="true" />
                  Nos partenaires
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 text-white hover:text-primary-500 transition-colors font-mont font-semibold"
                >
                  <span className="w-2 h-2 bg-primary-500 rounded-full" aria-hidden="true" />
                  Nous rejoindre
                </Link>
              </nav>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
