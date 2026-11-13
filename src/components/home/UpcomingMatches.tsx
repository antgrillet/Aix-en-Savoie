'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, MapPin } from 'lucide-react'

interface WeekendRow {
  id: number
  day: string
  time: string
  equipeNom: string
  categorie: string
  adversaire: string
  lieu: string
  competition: string | null
  teamSlug: string
}

interface UpcomingMatchesProps {
  rows: WeekendRow[]
  period: string
}

const smoothEase = [0.22, 1, 0.36, 1] as const

export function UpcomingMatches({ rows, period }: UpcomingMatchesProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="bg-zinc-950 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: smoothEase }}
          className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary-500">
              {'// Au programme'}
            </p>
            <h2 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-white md:text-6xl">
              Le week-end
              <br />
              au gymnase
            </h2>
          </div>
          <p className="w-fit rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-widest tabular-nums text-neutral-300">
            {period}
          </p>
        </motion.div>

        <div className="border-t border-white/10">
          {rows.map((row, i) => (
            <motion.div
              key={row.id}
              initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: reduceMotion ? 0 : i * 0.06,
                duration: 0.5,
                ease: smoothEase,
              }}
              className="border-b border-white/10 last:border-b-0"
            >
              <Link
                href={`/equipes/${row.teamSlug}`}
                aria-label={`${row.equipeNom} vs ${row.adversaire} — ${row.day} à ${row.time}, voir l'équipe`}
                className="group flex flex-col gap-3 px-2 py-5 transition-colors duration-200 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 sm:flex-row sm:items-center sm:gap-6 md:px-6 md:py-6"
              >
                {/* Date + heure */}
                <div className="flex items-center gap-3 sm:w-48 sm:shrink-0 sm:flex-col sm:items-start sm:gap-1.5">
                  <span className="rounded-lg border border-primary-500/30 bg-primary-500/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-400">
                    {row.day}
                  </span>
                  <span className="font-display text-xl font-bold tabular-nums text-white md:text-2xl">
                    {row.time}
                  </span>
                </div>

                {/* Affiche */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-display text-lg font-bold uppercase tracking-tight text-white transition-colors duration-200 group-hover:text-primary-400 md:text-xl">
                      {row.equipeNom}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-600">vs</span>
                    <span className="text-base font-semibold text-neutral-300 md:text-lg">
                      {row.adversaire}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                    <span className="font-mono uppercase tracking-wider">{row.categorie}</span>
                    {row.competition && (
                      <span className="hidden rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400 sm:inline-block">
                        {row.competition}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" aria-hidden />
                      {row.lieu}
                    </span>
                  </div>
                </div>

                {/* Badge domicile + flèche */}
                <div className="flex items-center justify-between gap-4 sm:justify-end md:gap-6">
                  <span className="rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-primary-400">
                    Domicile
                  </span>
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-neutral-500 transition-[border-color,color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:border-primary-500/50 group-hover:text-primary-400"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
