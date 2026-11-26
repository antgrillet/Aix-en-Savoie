import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatDateLongue, formatHeure, formatJourCourt } from '@/lib/dates'
import { SideCard } from './SideCard'

export interface EquipeContexte {
  nom: string
  slug: string
  categorie: string
  position: number | null
  prochainMatch: {
    adversaire: string
    date: Date
    domicile: boolean
  } | null
}

interface ArticleContextProps {
  date: Date
  equipe: EquipeContexte | null
}

const libelle = 'font-mono text-[11px] uppercase tracking-[0.1em] text-neutral-400'

function Ligne({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="mb-3.5 flex flex-col last:mb-0 gap-0.5 text-sm text-neutral-300">
      {label && <span className={libelle}>{label}</span>}
      {children}
    </div>
  )
}

const rang = (position: number) => (position === 1 ? '1er' : `${position}e`)

/** Cartes « Dans cet article » et « Prochain match » de la colonne latérale. */
export function ArticleContext({ date, equipe }: ArticleContextProps) {
  const details = equipe
    ? [equipe.categorie, equipe.position ? `${rang(equipe.position)} du championnat` : null]
        .filter(Boolean)
        .join(' · ')
    : ''

  return (
    <>
      <SideCard title="Dans cet article">
        {equipe && (
          <Ligne label="Équipe">
            <b className="text-base font-bold text-white">{equipe.nom}</b>
            {details && <span className="text-neutral-400">{details}</span>}
          </Ligne>
        )}
        <Ligne label="Publié le">
          <time dateTime={date.toISOString()} className="text-base font-bold text-white">
            {formatDateLongue(date)}
          </time>
        </Ligne>
        {equipe && (
          <Link
            href={`/equipes/${equipe.slug}`}
            className="mt-1 flex min-h-12 w-full items-center justify-center rounded-full bg-primary-500 px-6 font-extrabold text-zinc-950 transition-colors hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
          >
            Voir l&apos;équipe
          </Link>
        )}
      </SideCard>

      {equipe?.prochainMatch && (
        <SideCard title="Prochain match">
          <Ligne>
            <b className="text-base font-bold text-white">{equipe.nom}</b>
            <time dateTime={equipe.prochainMatch.date.toISOString()}>
              {formatJourCourt(equipe.prochainMatch.date).toLowerCase()} · {formatHeure(equipe.prochainMatch.date)}
            </time>
            <span className="text-neutral-400">
              vs {equipe.prochainMatch.adversaire} · {equipe.prochainMatch.domicile ? 'Domicile' : 'Extérieur'}
            </span>
          </Ligne>
        </SideCard>
      )}
    </>
  )
}
