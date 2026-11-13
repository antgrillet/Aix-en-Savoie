'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const smoothEase = [0.22, 1, 0.36, 1] as const

export function JoinClubCTA() {
  const reduceMotion = useReducedMotion()

  const reveal = (delay: number) => ({
    initial: reduceMotion ? undefined : ({ opacity: 0, y: 20 } as const),
    whileInView: reduceMotion ? undefined : ({ opacity: 1, y: 0 } as const),
    viewport: { once: true, margin: '-80px' } as const,
    transition: { delay: reduceMotion ? 0 : delay, duration: 0.7, ease: smoothEase },
  })

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      {/* Halo lumineux */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-white/10 blur-[120px]"
      />

      {/* Mot géant décoratif en fond : contour discret */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-black uppercase leading-none"
        style={{
          color: 'transparent',
          WebkitTextStrokeWidth: '1px',
          WebkitTextStrokeColor: 'rgba(255,255,255,0.07)',
        }}
      >
        HBC AIX
      </span>

      <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 md:py-36 lg:px-8">
        <motion.p
          {...reveal(0)}
          className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-white/80"
        >
          Baby Hand · Jeunes · Seniors · Bénévoles
        </motion.p>

        <motion.h2
          initial={reduceMotion ? undefined : { opacity: 0, y: 24, filter: 'blur(12px)' }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: reduceMotion ? 0 : 0.1, duration: 0.8, ease: smoothEase }}
          className="font-display text-[clamp(2.75rem,8vw,7rem)] font-black uppercase leading-[0.92] tracking-tight text-white"
        >
          Rejoins
          <br />
          le club
        </motion.h2>

        <motion.p
          {...reveal(0.25)}
          className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90"
        >
          Du Baby Hand aux seniors, nous accueillons de nouveaux joueurs toute
          l&apos;année. Parents, joueurs ou futurs bénévoles : dites-nous ce
          qui vous intéresse, nous vous recontactons rapidement.
        </motion.p>

        <motion.div
          {...reveal(0.4)}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <div className="relative inline-flex">
            {/* Anneaux pulsants */}
            {!reduceMotion && (
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-white/30"
                style={{ animationDuration: '2s' }}
              />
            )}
            <Link
              href="/contact?sujet=inscription"
              className="group relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-zinc-950 transition-[background-color,transform] duration-200 hover:bg-zinc-100 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500"
            >
              Demander une inscription
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
          <Link
            href="/equipes"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-8 py-4 font-bold text-white transition-[background-color,border-color,transform] duration-200 hover:bg-white/10 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-500"
          >
            Voir les catégories
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
