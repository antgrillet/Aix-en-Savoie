'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Handshake, ArrowRight, ExternalLink } from 'lucide-react'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'
import { normalizeImagePath } from '@/lib/utils'

interface Partenaire {
  id: number
  nom: string
  logo: string
  site?: string | null
  partenaire_majeur: boolean
}

interface FeaturedPartnersProps {
  partenaires: Partenaire[]
}

export function FeaturedPartners({ partenaires }: FeaturedPartnersProps) {
  if (!partenaires || partenaires.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-zinc-950 bg-opacity-95 overflow-hidden relative">
      {/* Éléments graphiques décoratifs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-pattern" />
      <div className="absolute top-20 right-20 w-40 h-40 bg-secondary-500 rounded-full filter blur-3xl opacity-10" />
      <div className="absolute bottom-20 left-20 w-60 h-60 bg-primary-500 rounded-full filter blur-3xl opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent via-primary-500 to-primary-500" />
            <Handshake className="w-6 h-6 text-primary-500" />
            <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent via-primary-500 to-primary-500" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center relative">
            Nos Partenaires
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-center">
            Ils croient en notre projet et nous accompagnent au quotidien.
            Un grand merci pour leur soutien !
          </p>
        </motion.div>

        {/* Grille de logos partenaires */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12"
        >
          {partenaires.map((partenaire) => {
            const content = (
              <motion.div
                variants={staggerItem}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-primary-500/50 transition-all duration-300"
              >
                {/* Badge pour partenaires majeurs */}
                {partenaire.partenaire_majeur && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg z-10">
                    <span className="text-white text-xs font-bold">★</span>
                  </div>
                )}

                <div className="relative h-20 flex items-center justify-center">
                  <Image
                    src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
                    alt={partenaire.nom}
                    fill
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                    sizes="(max-width: 768px) 50vw, 16vw"
                  />
                </div>

                {/* Icône lien externe pour les partenaires avec site */}
                {partenaire.site && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-primary-500" />
                  </div>
                )}
              </motion.div>
            )

            if (partenaire.site) {
              return (
                <a
                  key={partenaire.id}
                  href={partenaire.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  {content}
                </a>
              )
            }

            return <div key={partenaire.id}>{content}</div>
          })}
        </motion.div>

        {/* CTA vers la page partenaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/partenaires"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 transform hover:-translate-y-1"
          >
            Découvrir tous nos partenaires
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Bandeau "Devenez partenaire" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-secondary-500/10 border border-primary-500/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-3">
            Devenez Partenaire
          </h3>
          <p className="text-neutral-300 mb-6 max-w-2xl mx-auto">
            Rejoignez nos partenaires et contribuez au développement du handball local
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-bold hover:bg-white/20 transition-all"
          >
            <Handshake className="w-5 h-5" />
            Nous contacter
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
