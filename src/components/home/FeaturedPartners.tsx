'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
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
  const shouldReduceMotion = useReducedMotion()

  if (!partenaires || partenaires.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-zinc-950 relative">
      <div className="absolute inset-0 opacity-10 bg-pattern pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={shouldReduceMotion ? undefined : fadeInUp}
          className="mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-transparent to-primary-500" />
            <Handshake className="w-6 h-6 text-primary-500" />
            <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-transparent to-primary-500" />
          </div>

          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 text-center">
            Nos Partenaires
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-center">
            Ils croient en notre projet et nous accompagnent au quotidien.
            Un grand merci pour leur soutien !
          </p>
        </motion.div>

        {/* Grille de logos partenaires - traitement uniforme sur fond clair */}
        <motion.div
          variants={shouldReduceMotion ? undefined : staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12"
        >
          {partenaires.map((partenaire) => {
            const content = (
              <motion.div
                variants={shouldReduceMotion ? undefined : staggerItem}
                className="group relative h-full bg-white rounded-xl border border-white/10 p-4 hover:border-primary-500 transition-colors duration-200"
              >
                {partenaire.partenaire_majeur && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-lg z-10 text-white text-xs font-bold">
                    ★
                  </span>
                )}

                <div className="relative h-16 flex items-center justify-center">
                  <Image
                    src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
                    alt={partenaire.nom}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 50vw, 16vw"
                  />
                </div>

                {partenaire.site && (
                  <ExternalLink className="absolute bottom-2 right-2 w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
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
                  className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-xl"
                >
                  {content}
                </a>
              )
            }

            return <div key={partenaire.id}>{content}</div>
          })}
        </motion.div>

        {/* CTA vers la page partenaires */}
        <div className="text-center">
          <Link
            href="/partenaires"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            Découvrir tous nos partenaires
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
