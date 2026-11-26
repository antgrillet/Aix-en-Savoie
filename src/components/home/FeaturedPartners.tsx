import Link from 'next/link'
import Image from 'next/image'
import { ANTON, LIEN } from './affiche'
import { normalizeImagePath } from '@/lib/utils'

interface Partenaire {
  id: number
  nom: string
  logo: string
  site?: string | null
  partenaire_majeur: boolean
}

interface FeaturedPartnersProps {
  partenaires: Partenaire[]
}

/** Bande sombre (les logos du club sont prévus pour ce fond), logos posés à même le fond, sans boîtes */
export function FeaturedPartners({ partenaires }: FeaturedPartnersProps) {
  if (!partenaires || partenaires.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="titre-partenaires" className="border-y border-white/10 bg-[#1c1a17] py-16 text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="titre-partenaires" className={`${ANTON} text-4xl`}>
            Ils soutiennent le club
          </h2>
          <p className="flex flex-wrap gap-x-7">
            <Link href="/partenaires" className={LIEN}>
              Tous nos partenaires
            </Link>
            <Link href="/contact" className={LIEN}>
              Devenir partenaire
            </Link>
          </p>
        </div>

        <ul className="mt-9 flex flex-wrap items-center gap-x-14 gap-y-10">
          {partenaires.map((partenaire) => {
            const logo = (
              <span className="relative block h-12 w-[140px]">
                <Image
                  src={normalizeImagePath(partenaire.logo, '/img/partenaires/default.png')}
                  alt={partenaire.nom}
                  fill
                  sizes="140px"
                  className="object-contain opacity-75 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                />
              </span>
            )
            return (
              <li key={partenaire.id}>
                {partenaire.site ? (
                  <a
                    href={partenaire.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#1c1a17]"
                  >
                    {logo}
                    <span className="sr-only">(ouvre le site dans un nouvel onglet)</span>
                  </a>
                ) : (
                  logo
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
