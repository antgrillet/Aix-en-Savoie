import Image from 'next/image'
import Link from 'next/link'
import { normalizeImagePath } from '@/lib/utils'

export interface OffrePartenaire {
  titre: string
  /** Code à saisir ; null quand l'offre s'applique sans code. */
  code: string | null
}

export interface PartenaireListe {
  id: number
  nom: string
  slug: string | null
  categorie: string
  logo: string
  description: string
  offre: OffrePartenaire | null
}

/**
 * Carte de la liste des partenaires : logo sur tuile blanche, nom, phrase lisible
 * et, si le partenaire en propose une, l'offre licenciés mise en avant en vert.
 */
export function PartnerListItem({ partenaire }: { partenaire: PartenaireListe }) {
  const { offre } = partenaire

  const content = (
    <>
      <div className="relative h-16 w-[88px] flex-none rounded-xl border border-white/30 bg-white p-2.5 sm:h-20 sm:w-[110px] sm:p-3">
        <div className="relative h-full w-full">
          <Image
            src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
            alt=""
            fill
            className="object-contain"
            sizes="110px"
          />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-bold leading-snug text-white break-words transition-colors group-hover:text-primary-400">
          {partenaire.nom}
        </h3>
        {partenaire.description && (
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-neutral-300">
            {partenaire.description}
          </p>
        )}
        {offre && (
          <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border border-green-400/50 bg-green-400/10 px-3 py-2 text-sm">
            <p className="font-bold text-green-400">
              <span className="sr-only">Offre licenciés : </span>
              {offre.titre}
            </p>
            {offre.code && (
              <p className="text-neutral-200">
                Code <span className="select-all font-mono text-white">{offre.code}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )

  const className =
    'group flex h-full items-center gap-4 rounded-xl border bg-zinc-900/70 p-3.5 backdrop-blur-sm transition-colors duration-200 ' +
    (offre ? 'border-green-400/30 ' : 'border-white/10 ')

  if (partenaire.slug) {
    return (
      <Link
        href={`/partenaires/${partenaire.slug}`}
        className={`${className} hover:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500`}
      >
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}
