'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { NextMatchCountdown } from '@/components/home/NextMatchCountdown'

export interface HeroNextMatch {
  categorie: string
  adversaire: string
  domicile: boolean
  isoDate: string
  dayLabel: string
  timeLabel: string
}

interface HeroWelcomeProps {
  backgroundImage?: string | null
  tickerItems: string[]
  nextMatch?: HeroNextMatch | null
}

const smoothEase = [0.22, 1, 0.36, 1] as const

export function HeroWelcome({
  backgroundImage,
  tickerItems,
  nextMatch,
}: HeroWelcomeProps) {
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  // Parallaxe douce de la photo pendant le scroll du hero
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18])

  const lineReveal = (delay: number) => ({
    initial: reduceMotion ? undefined : ({ opacity: 0, y: 24, filter: 'blur(12px)' } as const),
    animate: reduceMotion ? undefined : ({ opacity: 1, y: 0, filter: 'blur(0px)' } as const),
    transition: reduceMotion ? undefined : { delay, duration: 0.8, ease: smoothEase },
  })

  return (
    <section ref={sectionRef} className="relative flex min-h-[92svh] flex-col overflow-hidden bg-zinc-950">
      {/* Fond : photo du club en duotone sombre + parallaxe */}
      <div className="absolute inset-0" aria-hidden>
        <motion.div
          style={reduceMotion ? undefined : { y: bgY, scale: bgScale }}
          className="absolute inset-0"
        >
          <Image
            src={backgroundImage || '/img/home/photo_equipe_fem.jpg'}
            alt=""
            fill
            priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/55 to-zinc-950" />
        <div className="absolute -left-48 top-1/4 h-[36rem] w-[36rem] rounded-full bg-primary-500/15 blur-[140px]" />
        <div className="absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-secondary-500/10 blur-[120px]" />
      </div>

      {/* Hairlines décoratives */}
      <div
        className="pointer-events-none absolute inset-0 mx-auto hidden max-w-7xl grid-cols-4 px-4 sm:px-6 lg:grid lg:px-8"
        aria-hidden
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border-l border-white/[0.04]" />
        ))}
      </div>

      {/* Contenu */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-4 pb-14 pt-32 sm:px-6 lg:px-8 lg:pt-36">
        <div
          className={
            nextMatch
              ? 'grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16'
              : 'w-full max-w-4xl'
          }
        >
          <div>
            <motion.p
              {...lineReveal(0.1)}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-primary-400"
            >
              Club de handball · Depuis 1964
            </motion.p>

            <h1 className="font-display text-[clamp(3rem,8vw,6.75rem)] font-black uppercase leading-[0.92] tracking-tight text-balance text-white">
              <motion.span {...lineReveal(0.2)} className="block">
                Le handball
              </motion.span>
              <motion.span
                {...lineReveal(0.34)}
                className="block"
                style={{
                  color: 'transparent',
                  WebkitTextStrokeWidth: '0.02em',
                  WebkitTextStrokeColor: '#f97316',
                }}
              >
                se vit
              </motion.span>
              <motion.span {...lineReveal(0.48)} className="block text-primary-500">
                ici.
              </motion.span>
            </h1>

            <motion.p
              {...lineReveal(0.62)}
              className="mt-8 max-w-xl text-lg leading-relaxed text-neutral-300 md:text-xl"
            >
              Une solide institution sportive aixoise, passionnée par le handball
              et dédiée à la formation de jeunes talents.
            </motion.p>

            <motion.div
              {...lineReveal(0.76)}
              className="mt-10 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/contact?sujet=inscription"
                className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-primary-500 px-8 py-4 font-bold text-white transition-[background-color,transform] duration-200 hover:bg-primary-600 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Inscrire un joueur
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/equipes"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 font-bold text-white transition-[background-color,border-color,transform] duration-200 hover:border-white/40 hover:bg-white/5 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Découvrir nos équipes
              </Link>
            </motion.div>
          </div>

          {/* Carte « Prochain match » en glassmorphism */}
          {nextMatch && (
            <motion.aside
              {...lineReveal(0.55)}
              aria-label={`Prochain match : ${nextMatch.categorie} contre ${nextMatch.adversaire}, ${nextMatch.dayLabel} à ${nextMatch.timeLabel}`}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-7"
            >
              {/* Liseré orange */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/80 to-transparent"
              />

              <div className="flex items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.25em] text-primary-400">
                  <span className="relative flex h-2 w-2">
                    {!reduceMotion && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500 opacity-60" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
                  </span>
                  Prochain match
                </p>
                <span className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-300">
                  {nextMatch.domicile ? 'Domicile' : 'Extérieur'}
                </span>
              </div>

              <div className="mt-5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="font-display text-2xl font-black uppercase tracking-tight text-white">
                    HBC Aix
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                    vs
                  </span>
                  <span className="text-lg font-bold leading-tight text-neutral-200">
                    {nextMatch.adversaire}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] tabular-nums text-neutral-400">
                  {nextMatch.categorie} · {nextMatch.dayLabel} · {nextMatch.timeLabel}
                </p>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <NextMatchCountdown isoDate={nextMatch.isoDate} />
              </div>

              <Link
                href="/calendrier"
                className="group mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-300 transition-colors duration-200 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Calendrier complet
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.aside>
          )}
        </div>
      </div>

      {/* Ticker broadcast : prochains matchs + derniers résultats */}
      {tickerItems.length > 0 && (
        <div className="group relative z-10 overflow-hidden border-t border-white/10 bg-black/40 py-4 backdrop-blur-sm">
          <div className="animate-marquee-45 flex w-max whitespace-nowrap group-hover:[animation-play-state:paused]">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span
                key={i}
                aria-hidden={i >= tickerItems.length}
                className="flex items-center gap-4 pr-12 pl-4 font-mono text-xs uppercase tracking-[0.15em] text-neutral-400"
              >
                <span className="text-primary-500" aria-hidden>
                  ◆
                </span>
                {item}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-zinc-950 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-zinc-950 to-transparent" />
        </div>
      )}
    </section>
  )
}
