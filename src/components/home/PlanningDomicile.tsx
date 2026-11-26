'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ANTON, SCRIPT, TitreAffiche } from './affiche'

export interface LigneDomicile {
  id: number
  /** « 19H00 » */
  heure: string
  equipe: string
  categorie: string
  adversaire: string
  /** Équipe phare : ligne noire, comme les seniors sur le planning du club */
  featured: boolean
  genre: string
}

export interface JourDomicile {
  /** Jour à Paris, AAAA-MM-JJ */
  cle: string
  /** « Samedi 28 » */
  libelle: string
  lignes: LigneDomicile[]
}

interface PlanningDomicileProps {
  /** « WEEKEND DU 28 – 29 NOVEMBRE » */
  titreWeekend: string
  jours: JourDomicile[]
  salle: string | null
  matchsExterieur: number
}

type Filtre = 'tous' | 'featured' | 'masculin' | 'feminin'

const FILTRES: { valeur: Filtre; libelle: string }[] = [
  { valeur: 'tous', libelle: 'Tous' },
  { valeur: 'featured', libelle: 'À la Une' },
  { valeur: 'masculin', libelle: 'Masculins' },
  { valeur: 'feminin', libelle: 'Féminines' },
]

function garder(ligne: LigneDomicile, filtre: Filtre): boolean {
  if (filtre === 'featured') return ligne.featured
  if (filtre === 'masculin') return ligne.genre === 'MASCULIN'
  if (filtre === 'feminin') return ligne.genre === 'FEMININ'
  return true
}

/**
 * Planning des matchs à domicile du week-end, sur le fond gris des affiches :
 * une ligne par match, l'heure en grand, les équipes phares en noir.
 */
export function PlanningDomicile({ titreWeekend, jours, salle, matchsExterieur }: PlanningDomicileProps) {
  const [filtre, setFiltre] = useState<Filtre>('tous')
  const joursFiltres = jours
    .map((jour) => ({ ...jour, lignes: jour.lignes.filter((ligne) => garder(ligne, filtre)) }))
    .filter((jour) => jour.lignes.length > 0)

  return (
    <section
      id="planning-domicile"
      aria-labelledby="titre-planning"
      className="relative scroll-mt-24 overflow-hidden bg-[#efefef] py-20 text-zinc-950 md:py-28"
    >
      <Image src="/img/home/affiche/texture-gris.jpg" alt="" fill sizes="100vw" className="object-cover" />
      <Image
        src="/img/home/affiche/eclats-haut.jpg"
        alt=""
        width={400}
        height={340}
        className="pointer-events-none absolute right-0 top-0 hidden w-[300px] mix-blend-multiply [mask-image:radial-gradient(ellipse_at_top_right,#000_35%,transparent_72%)] md:block lg:w-[420px]"
      />
      <Image
        src="/img/home/affiche/eclats-bas.jpg"
        alt=""
        width={640}
        height={420}
        className="pointer-events-none absolute bottom-0 left-0 w-[320px] -scale-x-100 mix-blend-multiply [mask-image:radial-gradient(ellipse_at_bottom_right,#000_35%,transparent_72%)] md:w-[520px]"
      />

      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <TitreAffiche id="titre-planning" mot="Planning" script="Domicile" ton="sombre" />
        <p className="mt-3 text-center text-sm font-bold tracking-[0.2em] text-zinc-700">{titreWeekend}</p>

        <div
          role="group"
          aria-label="Filtrer les équipes"
          className="mx-auto mb-10 mt-8 flex w-max max-w-full flex-wrap justify-center gap-1.5 rounded-xl bg-zinc-950 p-1.5"
        >
          {FILTRES.map(({ valeur, libelle }) => (
            <button
              key={valeur}
              type="button"
              aria-pressed={filtre === valeur}
              onClick={() => setFiltre(valeur)}
              className={`min-h-11 rounded-lg px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                filtre === valeur ? 'bg-primary-500 text-white' : 'text-white hover:bg-white/10'
              }`}
            >
              {libelle}
            </button>
          ))}
        </div>

        {joursFiltres.length === 0 ? (
          <p className="mx-auto max-w-md rounded-2xl bg-white p-6 text-center font-semibold shadow-[0_12px_30px_-18px_rgba(0,0,0,0.4)]">
            {jours.length === 0 ? 'Pas de match à domicile ce week-end.' : 'Aucun match pour ce filtre ce week-end.'}
          </p>
        ) : (
          <div className="space-y-8">
            {joursFiltres.map((jour) => (
              <div key={jour.cle}>
                <h3 className={`${ANTON} mb-3 text-xl text-zinc-600`}>{jour.libelle}</h3>
                <ul className="grid gap-3.5 md:grid-cols-2">
                  {jour.lignes.map((ligne) => (
                    <li
                      key={ligne.id}
                      className={`flex items-center gap-4 rounded-2xl px-5 py-4 md:gap-5 md:px-6 ${
                        ligne.featured
                          ? 'bg-zinc-950 text-white shadow-[0_12px_30px_-18px_rgba(0,0,0,0.6)]'
                          : 'bg-white shadow-[0_12px_30px_-18px_rgba(0,0,0,0.4)]'
                      }`}
                    >
                      <span className={`${ANTON} w-24 shrink-0 text-4xl md:w-28 md:text-[44px] ${ligne.featured ? 'text-[#ff7a1a]' : 'text-primary-500'}`}>
                        {ligne.heure}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`${ANTON} block truncate text-[22px]`}>{ligne.equipe}</span>
                        <span className={`block truncate text-sm ${ligne.featured ? 'text-zinc-300' : 'text-zinc-600'}`}>
                          contre {ligne.adversaire}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {matchsExterieur > 0 && (
            <Link
              href="/equipes"
              className="inline-flex min-h-[52px] items-center gap-2.5 rounded-xl bg-primary-500 px-6 text-white transition-colors hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
            >
              <span className={`${ANTON} text-2xl`}>Planning</span>
              <span className={`${SCRIPT} text-3xl !text-zinc-950`}>Extérieur</span>
              <span className="font-bold">
                · {matchsExterieur} match{matchsExterieur > 1 ? 's' : ''}
              </span>
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/equipes"
            className="inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-zinc-950 px-6 font-bold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            Découvrir toutes nos équipes
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
        {salle && jours.length > 0 && (
          <p className="mt-7 text-center text-sm font-semibold text-zinc-700">Tous les matchs à domicile au {salle}</p>
        )}
      </div>
    </section>
  )
}
