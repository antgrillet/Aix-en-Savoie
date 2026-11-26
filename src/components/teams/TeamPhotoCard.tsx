import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { normalizeImagePath } from '@/lib/utils'
import type { EquipeListe } from './types'

const ordinal = (n: number) => (n === 1 ? '1er' : `${n}e`)

interface TeamPhotoCardProps {
  equipe: EquipeListe
  /** Les premières cartes sont visibles au chargement : leur photo est prioritaire. */
  priority?: boolean
}

/**
 * Carte « photo plein cadre » : la photo de l'équipe occupe toute la carte,
 * seuls la compétition, le rang, les créneaux et le prochain match sont incrustés.
 * Toute la carte est cliquable via le lien du titre (zone étendue).
 */
export function TeamPhotoCard({ equipe, priority = false }: TeamPhotoCardProps) {
  const { prochainMatch } = equipe

  return (
    <article className="group relative isolate flex min-h-[440px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-zinc-800 p-4 shadow-lg transition-shadow duration-300 hover:shadow-xl has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-primary-400 has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-zinc-900 sm:min-h-[470px]">
      <Image
        src={normalizeImagePath(equipe.photo, '/img/equipes/default.jpg')}
        alt={`Photo de l'équipe ${equipe.nom}`}
        fill
        priority={priority}
        sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
        className="-z-20 object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      {/* Voile : garantit la lisibilité du texte incrusté sur la photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-950/10 from-20% via-zinc-950/55 via-55% to-zinc-950/95"
      />

      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0 truncate rounded-full bg-primary-500 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wide text-zinc-950">
          {equipe.categorie}
        </span>
        {equipe.rang !== null && (
          <span className="shrink-0 rounded-full border border-white/30 bg-zinc-950/80 px-3 py-0.5 text-sm font-extrabold text-white">
            <span className="sr-only">Classement : </span>
            {ordinal(equipe.rang)}
          </span>
        )}
      </div>

      <div>
        <h3 className="mb-2 font-display text-3xl font-black uppercase leading-[1.05] tracking-tight text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.45)] [overflow-wrap:anywhere]">
          <Link
            href={`/equipes/${equipe.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {equipe.nom}
          </Link>
        </h3>

        {equipe.creneaux.length > 0 && (
          <p className="mb-3 flex items-start gap-1.5 text-sm text-zinc-200">
            <Clock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>
              <span className="sr-only">Entraînements : </span>
              {equipe.creneaux.join(' · ')}
            </span>
          </p>
        )}

        {prochainMatch && (
          <div className="flex flex-col gap-0.5 rounded-xl border border-white/20 bg-zinc-950/75 px-3.5 py-2.5 text-sm text-zinc-300 backdrop-blur-md">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary-300">
              Prochain match
            </span>
            <b className="font-bold uppercase text-white">{prochainMatch.adversaire}</b>
            <span>
              {prochainMatch.date} · {prochainMatch.domicile ? 'Domicile' : 'Extérieur'}
            </span>
          </div>
        )}

        <span aria-hidden="true" className="mt-3 block text-sm font-bold text-primary-300">
          Voir l&apos;équipe →
        </span>
      </div>
    </article>
  )
}
