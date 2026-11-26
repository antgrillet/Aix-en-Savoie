'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ANTON, LIEN, SCRIPT } from './affiche'

export interface LigneDomicile {
  id: number
  /** « 19H00 » */
  heure: string
  equipe: string
  categorie: string
  adversaire: string
  /** Équipe phare : nom en noir plein, les autres en gris */
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
  { valeur: 'featured', libelle: 'À la une' },
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
 * Planning des matchs à domicile du week-end, comme une grille horaire imprimée
 * sur le fond gris des affiches : une ligne par match, séparées par des filets.
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
      className="relative scroll-mt-24 overflow-hidden bg-[#f1efea] py-20 text-[#141210] md:py-24"
    >
      <Image src="/img/home/affiche/texture-gris.jpg" alt="" fill sizes="100vw" className="object-cover opacity-70" />
      <Image
        src="/img/home/affiche/eclats-haut.jpg"
        alt=""
        width={400}
        height={340}
        className="pointer-events-none absolute right-0 top-0 hidden w-[300px] mix-blend-multiply [mask-image:radial-gradient(ellipse_at_top_right,#000_35%,transparent_72%)] md:block lg:w-[380px]"
      />

      <div className="container relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 id="titre-planning">
          <span className={`${ANTON} block text-6xl md:text-[96px]`}>Planning</span>
          <span className={`${SCRIPT} -mt-5 block pl-24 text-5xl md:-mt-8 md:pl-48 md:text-[68px]`}>Domicile</span>
        </h2>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <p className="text-[15px] leading-relaxed text-stone-700">
            {titreWeekend.charAt(0) + titreWeekend.slice(1).toLowerCase()}
            {salle && jours.length > 0 && (
              <>
                <br />
                Tous les matchs au {salle}.
              </>
            )}
          </p>
          <div role="group" aria-label="Filtrer les équipes" className="flex flex-wrap gap-x-6">
            {FILTRES.map(({ valeur, libelle }) => (
              <button
                key={valeur}
                type="button"
                aria-pressed={filtre === valeur}
                onClick={() => setFiltre(valeur)}
                className={`min-h-11 border-b-[3px] text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                  filtre === valeur ? 'border-primary-500 text-[#141210]' : 'border-transparent text-stone-600 hover:text-[#141210]'
                }`}
              >
                {libelle}
              </button>
            ))}
          </div>
        </div>

        {joursFiltres.length === 0 ? (
          <p className="mt-10 border-t-2 border-[#141210] pt-5 font-semibold">
            {jours.length === 0 ? 'Pas de match à domicile ce week-end.' : 'Aucun match pour ce filtre ce week-end.'}
          </p>
        ) : (
          joursFiltres.map((jour) => (
            <div key={jour.cle} className="mt-9">
              <h3 className={`${ANTON} mb-1.5 text-[22px] text-stone-600`}>{jour.libelle}</h3>
              <ul>
                {jour.lignes.map((ligne) => (
                  <li
                    key={ligne.id}
                    className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-x-5 border-t border-[#141210]/15 py-3.5 md:grid-cols-[7.5rem_minmax(0,1.1fr)_minmax(0,1fr)_10rem]"
                  >
                    <span className={`${ANTON} row-span-2 text-3xl text-primary-500 md:row-span-1 md:text-[40px]`}>{ligne.heure}</span>
                    <span className={`${ANTON} truncate text-[22px] md:text-2xl ${ligne.featured ? '' : 'text-stone-700'}`}>
                      {ligne.equipe}
                    </span>
                    <span className="truncate">
                      contre <b className="font-semibold">{ligne.adversaire}</b>
                    </span>
                    <span className="hidden truncate text-right text-[13px] text-stone-500 md:block">{ligne.categorie}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}

        <p className="mt-8 border-t-2 border-[#141210] pt-5 text-[15px]">
          {matchsExterieur > 0
            ? `${matchsExterieur} autre${matchsExterieur > 1 ? 's' : ''} match${matchsExterieur > 1 ? 's' : ''} à l'extérieur ce week-end. `
            : 'Toutes nos équipes et leurs calendriers : '}
          <Link href="/equipes" className={LIEN}>
            {matchsExterieur > 0 ? 'Planning extérieur' : 'nos équipes'}
          </Link>
        </p>
      </div>
    </section>
  )
}
