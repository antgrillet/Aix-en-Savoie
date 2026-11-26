'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ListOrdered, Trophy } from 'lucide-react'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

export interface ResultatAccueil {
  id: number
  dateLabel: string
  domicile: boolean
  adversaire: string
  scoreEquipe: number
  scoreAdversaire: number
}

export interface LigneClassementAccueil {
  id: number
  position: number
  club: string
  points: number
  nous: boolean
}

export interface EquipeResultats {
  id: number
  nom: string
  categorie: string
  slug: string
  resultats: ResultatAccueil[]
  /** Haut du classement, plus la ligne du club si elle n'y est pas. */
  classement: LigneClassementAccueil[]
  totalEquipes: number
}

const ISSUES = {
  victoire: { label: 'Victoire', classes: 'bg-green-500/15 text-green-400 border-green-500/30' },
  defaite: { label: 'Défaite', classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
  nul: { label: 'Nul', classes: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' },
} as const

function issueDe(r: ResultatAccueil) {
  if (r.scoreEquipe > r.scoreAdversaire) return ISSUES.victoire
  if (r.scoreEquipe < r.scoreAdversaire) return ISSUES.defaite
  return ISSUES.nul
}

function CarteEquipe({ equipe }: { equipe: EquipeResultats }) {
  const notreLigne = equipe.classement.find((l) => l.nous)

  return (
    <motion.article
      variants={staggerItem}
      className="flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
    >
      {/* En-tête de l'équipe */}
      <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-white/10 bg-gradient-to-r from-primary-500/20 to-transparent">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-white truncate">{equipe.nom}</h3>
          <p className="text-sm font-semibold text-primary-400">{equipe.categorie}</p>
        </div>
        {notreLigne && (
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-white leading-none tabular-nums">
              {notreLigne.position}
              <span className="text-base align-top">{notreLigne.position === 1 ? 'er' : 'e'}</span>
            </p>
            <p className="text-xs text-neutral-300 mt-1">sur {equipe.totalEquipes}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 flex-1">
        {/* Derniers résultats */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-200 mb-3">
            <Trophy aria-hidden="true" className="w-4 h-4 text-primary-500" />
            Derniers résultats
          </h4>
          {equipe.resultats.length > 0 ? (
            <ul className="space-y-2">
              {equipe.resultats.map((r) => {
                const issue = issueDe(r)
                return (
                  <li key={r.id} className="rounded-xl bg-black/30 border border-white/5 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-neutral-300">
                      <span>
                        {r.dateLabel} · {r.domicile ? 'Dom.' : 'Ext.'}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 font-bold ${issue.classes}`}>
                        {issue.label}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-3 mt-1">
                      <span className="min-w-0 text-sm text-white line-clamp-2">{r.adversaire}</span>
                      <span className="text-lg font-bold text-white tabular-nums whitespace-nowrap">
                        {r.scoreEquipe} – {r.scoreAdversaire}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-neutral-300">Pas encore de match joué cette saison.</p>
          )}
        </div>

        {/* Classement */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-neutral-200 mb-3">
            <ListOrdered aria-hidden="true" className="w-4 h-4 text-primary-500" />
            Classement
          </h4>
          {equipe.classement.length > 0 ? (
            <table className="w-full text-sm">
              <caption className="sr-only">Classement de la poule de {equipe.nom}</caption>
              <thead>
                <tr className="text-xs text-neutral-300 border-b border-white/10">
                  <th scope="col" className="py-1.5 pl-2 text-left font-medium w-8">Pos</th>
                  <th scope="col" className="py-1.5 px-2 text-left font-medium">Équipe</th>
                  <th scope="col" className="py-1.5 pr-2 text-right font-medium w-10">Pts</th>
                </tr>
              </thead>
              <tbody>
                {equipe.classement.map((ligne, index) => {
                  const saut = index > 0 && ligne.position - equipe.classement[index - 1].position > 1
                  return (
                    <tr
                      key={ligne.id}
                      aria-current={ligne.nous ? 'true' : undefined}
                      className={`border-b border-white/5 ${saut ? 'border-t border-dashed border-t-white/20' : ''} ${
                        ligne.nous ? 'bg-primary-500/20 text-primary-300 font-bold' : 'text-white'
                      }`}
                    >
                      <td className="py-2 pl-2 tabular-nums">{ligne.position}</td>
                      <td className="py-2 px-2 uppercase text-xs leading-snug">{ligne.club}</td>
                      <td className="py-2 pr-2 text-right font-bold tabular-nums">{ligne.points}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-neutral-300">Classement pas encore publié.</p>
          )}
        </div>
      </div>

      <Link
        href={`/equipes/${equipe.slug}`}
        className="group flex items-center justify-center gap-2 border-t border-white/10 px-6 py-4 text-sm font-semibold text-primary-400 hover:bg-white/5 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
      >
        Voir l&apos;équipe et tout le calendrier
        <ArrowRight aria-hidden="true" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.article>
  )
}

export function ResultatsClassements({ equipes }: { equipes: EquipeResultats[] }) {
  if (equipes.length === 0) return null

  return (
    <section className="relative py-16 md:py-20 bg-zinc-900 overflow-hidden">
      <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500 rounded-full filter blur-3xl opacity-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Résultats &amp; Classements
          </h2>
          <div className="w-24 h-1 bg-primary-500 mx-auto mt-4 rounded-full" />
          <p className="text-neutral-300 max-w-2xl mx-auto mt-6">
            Les derniers scores et la place de nos équipes phares dans leur championnat.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className={`grid grid-cols-1 gap-6 ${equipes.length > 1 ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'}`}
        >
          {equipes.map((equipe) => (
            <CarteEquipe key={equipe.id} equipe={equipe} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
