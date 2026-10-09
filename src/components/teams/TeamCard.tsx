import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { normalizeImagePath } from '@/lib/utils'

interface Entrainement {
  jour: string
  heureDebut: string
  heureFin: string
  lieu: string
}

interface Equipe {
  id: number
  nom: string
  categorie: string
  niveau: string
  photo: string
  slug: string
  entrainements: Entrainement[]
}

interface TeamCardProps {
  equipe: Equipe
}

/** Carte d'équipe compacte (photo, niveau, premier créneau d'entraînement) */
export function TeamCard({ equipe }: TeamCardProps) {
  const entrainement = equipe.entrainements[0]

  return (
    <Link
      href={`/equipes/${equipe.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition-colors duration-200 hover:border-primary-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-800">
        <Image
          src={normalizeImagePath(equipe.photo, '/img/equipes/default.jpg')}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-sm bg-primary-500 px-2 py-1 font-eyebrow text-[0.65rem] text-neutral-950">
          {equipe.categorie}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-primary-300">
          {equipe.nom}
        </h3>
        <p className="mt-1 text-sm text-neutral-400">{equipe.niveau}</p>

        {entrainement && (
          <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-sm text-neutral-300">
            <li className="flex items-center gap-2">
              <Calendar className="size-4 shrink-0 text-primary-500" aria-hidden />
              <span className="font-semibold text-white">{entrainement.jour}</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-primary-500" aria-hidden />
              <span>
                {entrainement.heureDebut} - {entrainement.heureFin}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary-500" aria-hidden />
              <span>{entrainement.lieu}</span>
            </li>
          </ul>
        )}
      </div>
    </Link>
  )
}
