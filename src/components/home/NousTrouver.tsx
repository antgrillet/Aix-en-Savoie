'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Clock, MapPin, UserPlus } from 'lucide-react'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'
import { ADRESSE_CLUB, gymnaseDuClub } from '@/lib/gymnases'

interface NousTrouverProps {
  /** Gymnase où le club reçoit, s'il est connu. */
  lieu: string | null
  itineraire: string
}

function Carte({
  icon: Icon,
  titre,
  children,
  lien,
}: {
  icon: LucideIcon
  titre: string
  children: React.ReactNode
  lien: React.ReactNode
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-primary-500/50 transition-colors"
    >
      <span
        aria-hidden="true"
        className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary-500/20 text-primary-400"
      >
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-xl font-bold text-white mb-2">{titre}</h3>
      <div className="text-neutral-300 leading-relaxed flex-1">{children}</div>
      <div className="mt-5">{lien}</div>
    </motion.div>
  )
}

const LIEN =
  'group inline-flex items-center gap-2 rounded-sm font-semibold text-primary-400 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'

export function NousTrouver({ lieu, itineraire }: NousTrouverProps) {
  // L'adresse affichée est celle du gymnase où le club reçoit ; sans lieu connu, celle du club
  const adresse = lieu ? gymnaseDuClub(lieu)?.adresse ?? null : ADRESSE_CLUB
  return (
    <section className="relative py-16 md:py-20 bg-zinc-900 overflow-hidden">
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-primary-500 rounded-full filter blur-3xl opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Venir au club
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto mt-4 rounded-full" />
          <p className="text-neutral-300 max-w-2xl mx-auto mt-6">
            Un match à voir, une question ou l&apos;envie de jouer : voici où et quand nous trouver.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Carte
            icon={MapPin}
            titre="Le gymnase"
            lien={
              <a href={itineraire} target="_blank" rel="noopener noreferrer" className={LIEN}>
                Itinéraire
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                <span className="sr-only">(ouvre Google Maps dans un nouvel onglet)</span>
              </a>
            }
          >
            {lieu ? (
              <p>
                Nos matchs à domicile se jouent au <span className="text-white font-semibold">{lieu}</span>.
              </p>
            ) : (
              <p>Le lieu de chaque rencontre est indiqué sur la page de l&apos;équipe.</p>
            )}
            {adresse && <p className="mt-2 text-sm">{adresse}</p>}
          </Carte>

          <Carte
            icon={Clock}
            titre="Le secrétariat"
            lien={
              <Link href="/contact" className={LIEN}>
                Nous écrire
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            }
          >
            <p>
              Lundi – vendredi : 9h – 18h
              <br />
              Samedi : 9h – 12h
            </p>
            <p className="mt-2 text-sm">contact@hbcaixensavoie.fr</p>
          </Carte>

          <Carte
            icon={UserPlus}
            titre="Rejoindre le club"
            lien={
              <Link
                href="/contact?sujet=inscription"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-3 font-bold text-zinc-950 hover:bg-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              >
                Demander une inscription
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            }
          >
            <p>
              Du baby hand aux seniors, nous accueillons de nouveaux joueurs et de nouveaux bénévoles toute
              l&apos;année. Dites-nous ce qui vous intéresse, nous vous recontactons.
            </p>
            <Link href="/equipes" className={`${LIEN} mt-3 text-sm`}>
              Voir les catégories
            </Link>
          </Carte>
        </motion.div>
      </div>
    </section>
  )
}
